// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.REZDY_API_URL = 'https://api.rezdy.com/v1'
process.env.REZDY_API_KEY = 'test-api-key'
process.env.NODE_ENV = 'test'