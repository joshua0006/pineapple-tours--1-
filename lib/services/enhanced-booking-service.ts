/**
 * Enhanced booking service with comprehensive logging and step tracking
 */

import { BookingService, BookingRegistrationResult, BookingRequest, PaymentConfirmation } from './booking-service';
import { RezdyDirectBookingRequest } from '@/lib/types/rezdy';
import { BookingFormData } from '@/lib/utils/booking-transform';
import { bookingLogger } from '@/lib/utils/booking-debug-logger';

export interface BookingStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  duration?: number;
  data?: any;
  error?: string;
}

export interface BookingFlowTracker {
  sessionId: string;
  startTime: string;
  endTime?: string;
  currentStep?: string;
  steps: BookingStep[];
  totalDuration?: number;
  finalStatus: 'pending' | 'success' | 'failed';
  errorCount: number;
  warningCount: number;
}

export class EnhancedBookingService {
  private bookingService: BookingService;
  private activeFlows = new Map<string, BookingFlowTracker>();

  constructor() {
    this.bookingService = new BookingService();
  }

  /**
   * Start tracking a booking flow
   */
  private startFlow(type: 'direct' | 'legacy', identifier: string): string {
    const sessionId = bookingLogger.startSession('booking_attempt');
    
    const flow: BookingFlowTracker = {
      sessionId,
      startTime: new Date().toISOString(),
      steps: [],
      finalStatus: 'pending',
      errorCount: 0,
      warningCount: 0
    };

    this.activeFlows.set(sessionId, flow);
    
    bookingLogger.log('info', 'general', 'flow_start', `Started ${type} booking flow`, {
      sessionId,
      identifier,
      type
    });

    return sessionId;
  }

  /**
   * Add a step to the current flow
   */
  private addStep(sessionId: string, stepName: string, data?: any): void {
    const flow = this.activeFlows.get(sessionId);
    if (!flow) return;

    const step: BookingStep = {
      step: stepName,
      status: 'in_progress',
      startTime: new Date().toISOString(),
      data
    };

    flow.steps.push(step);
    flow.currentStep = stepName;

    bookingLogger.log('info', 'general', 'step_start', `Starting step: ${stepName}`, data);
  }

  /**
   * Complete a step
   */
  private completeStep(sessionId: string, stepName: string, success: boolean, result?: any, error?: string): void {
    const flow = this.activeFlows.get(sessionId);
    if (!flow) return;

    const step = flow.steps.find(s => s.step === stepName && s.status === 'in_progress');
    if (!step) return;

    step.status = success ? 'completed' : 'failed';
    step.endTime = new Date().toISOString();
    step.duration = new Date(step.endTime).getTime() - new Date(step.startTime!).getTime();
    
    if (error) {
      step.error = error;
      flow.errorCount++;
    }

    const level = success ? 'info' : 'error';
    const category = this.getCategoryFromStep(stepName);
    
    bookingLogger.log(level, category, stepName, `${success ? 'Completed' : 'Failed'} step: ${stepName}`, {
      duration: step.duration,
      result,
      error
    }, error ? new Error(error) : undefined);
  }

  /**
   * End the booking flow
   */
  private endFlow(sessionId: string, success: boolean, result?: any, error?: string): void {
    const flow = this.activeFlows.get(sessionId);
    if (!flow) return;

    flow.endTime = new Date().toISOString();
    flow.finalStatus = success ? 'success' : 'failed';
    flow.totalDuration = new Date(flow.endTime).getTime() - new Date(flow.startTime).getTime();

    const summary = {
      totalSteps: flow.steps.length,
      completedSteps: flow.steps.filter(s => s.status === 'completed').length,
      failedSteps: flow.steps.filter(s => s.status === 'failed').length,
      totalDuration: flow.totalDuration,
      errorCount: flow.errorCount,
      warningCount: flow.warningCount
    };

    bookingLogger.endSession(success ? 'completed' : 'failed', 
      `Booking flow ${success ? 'completed successfully' : 'failed'}: ${JSON.stringify(summary)}`);

    // Clean up
    this.activeFlows.delete(sessionId);
  }

  /**
   * Get category from step name
   */
  private getCategoryFromStep(stepName: string): 'validation' | 'network' | 'api' | 'payment' | 'transform' | 'general' {
    if (stepName.includes('validation') || stepName.includes('validate')) return 'validation';
    if (stepName.includes('payment') || stepName.includes('stripe')) return 'payment';
    if (stepName.includes('transform') || stepName.includes('mapping')) return 'transform';
    if (stepName.includes('api') || stepName.includes('submission') || stepName.includes('rezdy')) return 'api';
    if (stepName.includes('network') || stepName.includes('fetch')) return 'network';
    return 'general';
  }

  /**
   * Enhanced direct Rezdy booking submission with full tracking
   */
  async submitDirectRezdyBooking(bookingRequest: RezdyDirectBookingRequest): Promise<BookingRegistrationResult> {
    const sessionId = this.startFlow('direct', bookingRequest.resellerReference);

    try {
      // Step 1: Input validation
      this.addStep(sessionId, 'input_validation', {
        resellerReference: bookingRequest.resellerReference,
        hasCustomer: !!bookingRequest.customer,
        itemsCount: bookingRequest.items?.length || 0,
        paymentsCount: bookingRequest.payments?.length || 0
      });

      // Validate basic structure
      if (!bookingRequest.resellerReference) {
        throw new Error('Reseller reference is required');
      }
      if (!bookingRequest.customer) {
        throw new Error('Customer information is required');
      }
      if (!bookingRequest.items || bookingRequest.items.length === 0) {
        throw new Error('At least one item is required');
      }
      if (!bookingRequest.payments || bookingRequest.payments.length === 0) {
        throw new Error('Payment information is required');
      }

      this.completeStep(sessionId, 'input_validation', true);

      // Step 2: Customer validation
      this.addStep(sessionId, 'customer_validation', bookingRequest.customer);

      if (!bookingRequest.customer.firstName || !bookingRequest.customer.lastName) {
        throw new Error('Customer name is incomplete');
      }
      if (!bookingRequest.customer.email) {
        throw new Error('Customer email is required');
      }
      if (!bookingRequest.customer.phone) {
        throw new Error('Customer phone is required');
      }

      this.completeStep(sessionId, 'customer_validation', true);

      // Step 3: Items validation
      this.addStep(sessionId, 'items_validation', {
        itemsCount: bookingRequest.items.length,
        items: bookingRequest.items.map((item, index) => ({
          index,
          hasProductCode: 'productCode' in item,
          hasQuantities: 'quantities' in item && item.quantities && item.quantities.length > 0
        }))
      });

      const bookingItems = bookingRequest.items.filter(item => 'productCode' in item);
      if (bookingItems.length === 0) {
        throw new Error('No valid booking items found');
      }

      for (const item of bookingItems) {
        if (!item.productCode) {
          throw new Error('Product code is required for booking items');
        }
        if (!item.startTimeLocal) {
          throw new Error('Start time is required for booking items');
        }
        if (!item.quantities || item.quantities.length === 0) {
          throw new Error('Quantities are required for booking items');
        }

        const totalQuantity = item.quantities.reduce((sum, q) => sum + q.value, 0);
        if (totalQuantity === 0) {
          throw new Error('Total quantity must be greater than 0');
        }
      }

      this.completeStep(sessionId, 'items_validation', true);

      // Step 4: Payment validation
      this.addStep(sessionId, 'payment_validation', {
        paymentsCount: bookingRequest.payments.length,
        payments: bookingRequest.payments.map((p, index) => ({
          index,
          amount: p.amount,
          type: p.type,
          recipient: p.recipient
        }))
      });

      for (const payment of bookingRequest.payments) {
        if (!payment.amount || payment.amount <= 0) {
          throw new Error('Payment amount must be greater than 0');
        }
        if (!payment.type || (payment.type !== 'CASH' && payment.type !== 'CREDITCARD')) {
          throw new Error('Payment type must be CASH or CREDITCARD');
        }
        if (payment.recipient !== 'SUPPLIER') {
          throw new Error('Payment recipient must be SUPPLIER');
        }
      }

      this.completeStep(sessionId, 'payment_validation', true);

      // Step 5: API submission
      this.addStep(sessionId, 'api_submission', {
        apiUrl: process.env.REZDY_API_URL,
        hasApiKey: !!process.env.REZDY_API_KEY,
        isDevelopment: process.env.NODE_ENV === 'development'
      });

      const result = await this.bookingService.submitDirectRezdyBooking(bookingRequest);

      if (result.success) {
        this.completeStep(sessionId, 'api_submission', true, {
          orderNumber: result.orderNumber
        });

        // Step 6: Success handling
        this.addStep(sessionId, 'success_handling', result);
        this.completeStep(sessionId, 'success_handling', true);

        this.endFlow(sessionId, true, result);
        return result;
      } else {
        throw new Error(result.error || 'API submission failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Complete current step as failed
      const flow = this.activeFlows.get(sessionId);
      if (flow && flow.currentStep) {
        this.completeStep(sessionId, flow.currentStep, false, undefined, errorMessage);
      }

      this.endFlow(sessionId, false, undefined, errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Enhanced legacy booking registration with full tracking
   */
  async registerBooking(request: BookingRequest): Promise<BookingRegistrationResult> {
    const sessionId = this.startFlow('legacy', request.paymentConfirmation.orderReference || 'unknown');

    try {
      // Step 1: Input validation
      this.addStep(sessionId, 'input_validation', {
        hasBookingData: !!request.bookingData,
        hasPaymentConfirmation: !!request.paymentConfirmation,
        orderReference: request.paymentConfirmation.orderReference,
        transactionId: request.paymentConfirmation.transactionId
      });

      if (!request.bookingData) {
        throw new Error('Booking data is required');
      }
      if (!request.paymentConfirmation) {
        throw new Error('Payment confirmation is required');
      }

      this.completeStep(sessionId, 'input_validation', true);

      // Step 2: Payment validation
      this.addStep(sessionId, 'payment_validation', {
        transactionId: request.paymentConfirmation.transactionId,
        amount: request.paymentConfirmation.amount,
        status: request.paymentConfirmation.status,
        paymentMethod: request.paymentConfirmation.paymentMethod
      });

      if (!request.paymentConfirmation.transactionId) {
        throw new Error('Transaction ID is required');
      }
      if (!request.paymentConfirmation.amount || request.paymentConfirmation.amount <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }
      if (request.paymentConfirmation.status !== 'success') {
        throw new Error('Payment must be successful');
      }

      this.completeStep(sessionId, 'payment_validation', true);

      // Step 3: Booking data validation
      this.addStep(sessionId, 'booking_validation', {
        productCode: request.bookingData.product.code,
        sessionId: request.bookingData.session.id,
        guestCount: request.bookingData.guests?.length || 0,
        guestCounts: request.bookingData.guestCounts,
        contactEmail: request.bookingData.contact.email,
        totalAmount: request.bookingData.pricing.total
      });

      // Validate required fields
      if (!request.bookingData.product.code) {
        throw new Error('Product code is required');
      }
      if (!request.bookingData.session.id) {
        throw new Error('Session ID is required');
      }
      if (!request.bookingData.contact.email) {
        throw new Error('Customer email is required');
      }

      // Validate guests
      const hasGuests = request.bookingData.guests && request.bookingData.guests.length > 0;
      const hasGuestCounts = request.bookingData.guestCounts && 
        (request.bookingData.guestCounts.adults > 0 || 
         request.bookingData.guestCounts.children > 0 || 
         request.bookingData.guestCounts.infants > 0);

      if (!hasGuests && !hasGuestCounts) {
        throw new Error('Guest information is required');
      }

      this.completeStep(sessionId, 'booking_validation', true);

      // Step 4: Amount verification
      this.addStep(sessionId, 'amount_verification', {
        bookingTotal: request.bookingData.pricing.total,
        paymentAmount: request.paymentConfirmation.amount,
        difference: Math.abs(request.bookingData.pricing.total - request.paymentConfirmation.amount)
      });

      if (Math.abs(request.bookingData.pricing.total - request.paymentConfirmation.amount) > 0.01) {
        throw new Error(`Amount mismatch: booking total (${request.bookingData.pricing.total}) does not match payment amount (${request.paymentConfirmation.amount})`);
      }

      this.completeStep(sessionId, 'amount_verification', true);

      // Step 5: Data transformation
      this.addStep(sessionId, 'data_transformation');

      // Log the transformation process
      bookingLogger.log('info', 'transform', 'transform_start', 'Starting booking data transformation', {
        productCode: request.bookingData.product.code,
        paymentMethod: request.paymentConfirmation.paymentMethod
      });

      // Call the actual service
      const result = await this.bookingService.registerBooking(request);

      if (result.success) {
        this.completeStep(sessionId, 'data_transformation', true, {
          orderNumber: result.orderNumber
        });

        // Step 6: Success handling
        this.addStep(sessionId, 'success_handling', result);
        this.completeStep(sessionId, 'success_handling', true);

        this.endFlow(sessionId, true, result);
        return result;
      } else {
        throw new Error(result.error || 'Booking registration failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Complete current step as failed
      const flow = this.activeFlows.get(sessionId);
      if (flow && flow.currentStep) {
        this.completeStep(sessionId, flow.currentStep, false, undefined, errorMessage);
      }

      this.endFlow(sessionId, false, undefined, errorMessage);

      return {
        success: false,
        error: errorMessage,
        paymentConfirmation: request.paymentConfirmation
      };
    }
  }

  /**
   * Create booking request with logging
   */
  createBookingRequest(
    bookingData: BookingFormData,
    paymentConfirmation: PaymentConfirmation
  ): BookingRequest {
    bookingLogger.log('info', 'general', 'create_request', 'Creating booking request', {
      productCode: bookingData.product.code,
      transactionId: paymentConfirmation.transactionId,
      amount: paymentConfirmation.amount
    });

    return BookingService.createBookingRequest(bookingData, paymentConfirmation);
  }

  /**
   * Get active flow information
   */
  getActiveFlows(): BookingFlowTracker[] {
    return Array.from(this.activeFlows.values());
  }

  /**
   * Get flow by session ID
   */
  getFlow(sessionId: string): BookingFlowTracker | undefined {
    return this.activeFlows.get(sessionId);
  }

  /**
   * Force end a flow (for cleanup)
   */
  forceEndFlow(sessionId: string): void {
    const flow = this.activeFlows.get(sessionId);
    if (flow) {
      this.endFlow(sessionId, false, undefined, 'Flow forcefully ended');
    }
  }
}

// Export enhanced service as default
export const enhancedBookingService = new EnhancedBookingService();