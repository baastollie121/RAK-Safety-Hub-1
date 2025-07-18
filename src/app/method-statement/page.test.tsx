
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MethodStatementPage from './page';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateMethodStatement } from '@/ai/flows/method-statement-generator';
import * as pdfHook from '@/hooks/use-download-pdf';
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('@/hooks/use-toast');
jest.mock('@/ai/flows/method-statement-generator');
jest.mock('@/hooks/use-download-pdf');
jest.mock('@/lib/firebase', () => ({
  db: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));


const mockUseAuth = useAuth as jest.Mock;
const mockUseToast = useToast as jest.Mock;
const mockGenerateMethodStatement = generateMethodStatement as jest.Mock;
const mockUseDownloadPdf = pdfHook.useDownloadPdf as jest.Mock;
const mockAddDoc = addDoc as jest.Mock;

const mockToast = jest.fn();
const mockHandleDownload = jest.fn();

describe('MethodStatementPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({ user: { uid: 'test-user-id', email: 'test@example.com' } });
    mockUseToast.mockReturnValue({ toast: mockToast });
    mockUseDownloadPdf.mockReturnValue({ isDownloading: false, handleDownload: mockHandleDownload });
    mockAddDoc.mockResolvedValue({ id: 'new-doc-id' });
  });

  const fillOutForm = () => {
    fireEvent.change(screen.getByLabelText(/Company Name/i), { target: { value: 'Test Co' } });
    fireEvent.change(screen.getByLabelText(/Project Title/i), { target: { value: 'Test Project' } });
    fireEvent.change(screen.getByLabelText(/Specific Task \/ Operation Title/i), { target: { value: 'Test Task' } });
    fireEvent.change(screen.getByLabelText(/Scope of Work/i), { target: { value: 'Test Scope' } });
    fireEvent.change(screen.getByLabelText(/Identified Hazards/i), { target: { value: 'Test Hazards' } });
    fireEvent.change(screen.getByLabelText(/Personal Protective Equipment \(PPE\)/i), { target: { value: 'Test PPE' } });
    fireEvent.change(screen.getByLabelText(/Equipment & Resources/i), { target: { value: 'Test Equipment' } });
    fireEvent.change(screen.getByPlaceholderText(/Step 1 description.../i), { target: { value: 'Test Procedure' } });
    fireEvent.change(screen.getByLabelText(/Training & Competency/i), { target: { value: 'Test Training' } });
    fireEvent.change(screen.getByLabelText(/Supervision & Monitoring/i), { target: { value: 'Test Monitoring' } });
    fireEvent.change(screen.getByLabelText(/Emergency Procedures/i), { target: { value: 'Test Emergency' } });
  }

  it('renders the form correctly with initial values', () => {
    render(<MethodStatementPage />);
    
    expect(screen.getByRole('heading', { name: /Method Statement Generator/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prepared By/i)).toHaveValue('test@example.com');
    expect(screen.getByRole('button', { name: /Generate Method Statement/i })).toBeInTheDocument();
  });

  it('shows validation errors for required fields on submit', async () => {
    render(<MethodStatementPage />);
    
    fireEvent.click(screen.getByRole('button', { name: /Generate Method Statement/i }));

    // Wait for validation errors to appear
    expect(await screen.findByText('Company Name is required.')).toBeInTheDocument();
    expect(await screen.findByText('Project Title is required.')).toBeInTheDocument();
    expect(await screen.findByText('Scope of Work is required.')).toBeInTheDocument();
  });

  it('can add and remove procedure steps', async () => {
    render(<MethodStatementPage />);
    
    const addStepButton = screen.getByRole('button', { name: /Add Step/i });
    fireEvent.click(addStepButton);
    fireEvent.click(addStepButton);
    
    expect(screen.getAllByPlaceholderText(/Step \d+ description.../i)).toHaveLength(3);
    
    const removeButtons = screen.getAllByRole('button', { name: '' });
    // Click the remove button for the second step
    fireEvent.click(removeButtons[1]);

    expect(screen.getAllByPlaceholderText(/Step \d+ description.../i)).toHaveLength(2);
  });
  
  it('successfully generates a method statement on valid form submission', async () => {
    const mockResult = { methodStatementDocument: '## Generated Document\n\nThis is a test document.' };
    mockGenerateMethodStatement.mockResolvedValue(mockResult);

    render(<MethodStatementPage />);

    fillOutForm();

    fireEvent.click(screen.getByRole('button', { name: /Generate Method Statement/i }));
    
    // Check for loading state
    expect(screen.getByRole('button', { name: /Generating.../i })).toBeInTheDocument();

    // Wait for the result to appear
    expect(await screen.findByText('Generated Method Statement')).toBeInTheDocument();
    expect(screen.getByText('This is a test document.')).toBeInTheDocument();

    // Check for success toast
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Method Statement generated successfully.',
    });
  });

    it('handles errors during method statement generation', async () => {
        mockGenerateMethodStatement.mockRejectedValue(new Error('AI failed'));

        render(<MethodStatementPage />);
        fillOutForm();

        fireEvent.click(screen.getByRole('button', { name: /Generate Method Statement/i }));

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to generate Method Statement.',
            });
        });

        expect(screen.queryByText('Generated Method Statement')).not.toBeInTheDocument();
    });

    it('calls the download hook when download button is clicked', async () => {
        const mockResult = { methodStatementDocument: '## PDF Content' };
        mockGenerateMethodStatement.mockResolvedValue(mockResult);
        
        render(<MethodStatementPage />);
        
        fillOutForm();
        fireEvent.click(screen.getByRole('button', { name: /Generate Method Statement/i }));
        
        const downloadButton = await screen.findByRole('button', { name: /Download as PDF/i });
        fireEvent.click(downloadButton);
        
        await waitFor(() => {
            expect(mockHandleDownload).toHaveBeenCalled();
        });
    });

    it('saves a generated statement to firestore', async () => {
        const mockResult = { methodStatementDocument: '## Saved Content' };
        mockGenerateMethodStatement.mockResolvedValue(mockResult);

        render(<MethodStatementPage />);

        fillOutForm();
        fireEvent.click(screen.getByRole('button', { name: /Generate Method Statement/i }));

        const saveButton = await screen.findByRole('button', { name: /Save Document/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(mockAddDoc).toHaveBeenCalledWith(
              expect.anything(), // collection ref
              expect.objectContaining({
                docType: 'MethodStatement',
                userId: 'test-user-id',
                title: 'Test Task'
              })
          );
        });

        expect(mockToast).toHaveBeenCalledWith({
            title: 'Success',
            description: 'Method Statement "Test Task" has been saved.',
        });
    });
});
