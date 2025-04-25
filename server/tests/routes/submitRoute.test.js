const request = require('supertest');
const express = require('express');
const app = express();

// Mocking Prisma Client
jest.mock('@prisma/client', () => {
  const upsert = jest.fn();
  return {
    PrismaClient: jest.fn(() => ({
      udyamForm: {
        upsert,
      },
    })),
  };
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import your controller
const formController = require('../../controllers/formController');

// Mock Express route
app.use(express.json());
app.post('/submit', formController.submitForm);

describe('POST /submit', () => {
  it('should successfully submit the form and return a success message', async () => {
    // Mock data that should be submitted
    const formData = {
      aadhaarNumber: '123456789012',
      aadhaarName: 'John Doe',
      organisationType: 'Private',
      panNumber: 'ABCDE1234F',
      panName: 'John Doe',
      dob: '01/01/1990',
    };

    // Mock Prisma upsert response
    prisma.udyamForm.upsert.mockResolvedValue({
      ...formData,
      id: 1,  // Simulate an ID being generated after form submission
    });

    // Make the POST request
    const response = await request(app)
      .post('/submit')
      .send(formData)
      .expect(200);

    // Assert that the response is as expected
    expect(response.body.message).toBe('Form saved successfully!');
  });

  it('should handle errors and return a failure message if the form save fails', async () => {
    const formData = {
      aadhaarNumber: '123456789012',
      aadhaarName: 'John Doe',
      organisationType: 'Private',
      panNumber: 'ABCDE1234F',
      panName: 'John Doe',
      dob: '01/01/1990',
    };

    // Mock Prisma upsert to throw an error
    prisma.udyamForm.upsert.mockRejectedValue(new Error('Database error'));

    // Make the POST request
    const response = await request(app)
      .post('/submit')
      .send(formData)
      .expect(500);

    // Assert that the error response is as expected
    expect(response.body.error).toBe('Failed to save form.');
  });
});
