
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MethodStatementPage from './page';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateMethodStatement } from '@/ai/flows/method-statement-generator';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('@/hooks/use-toast');
jest.mock('@/ai/flows/method-statement-generator');
jest.mock('html2canvas');
jest.mock('jspdf');

const mockUseAuth = useAuth as jest.Mock;
const mockUseToast = useToast as jest.Mock;
const mockGenerateMethodStatement = generateMethodStatement as jest.Mock;
const mockHtml2canvas = html2canvas as jest.Mock;
const mockJsPDF = jsPDF as jest.Mock;

const mockToast = jest.fn();
const mockSave = jest.fn();

describe('MethodStatementPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    mockUseToast.mockReturnValue({ toast: mockToast });

    // Mock jsPDF instance and its methods
    mockJsPDF.mockImplementation(() => ({
      addImage: jest.fn(),
      addPage: jest.fn(),
      save: mockSave,
      internal: {
        pageSize: {
          getWidth: () => 210,
          getHeight: () => 297,
        },
      },
    }));
  });

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
    const mockResult = { methodStatementDocument: '## Generated Document

This is a test document.' };
    mockGenerateMethodStatement.mockResolvedValue(mockResult);

    render(<MethodStatementPage />);

    // Fill out the form
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

        // Fill out the form with valid data
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

    it('downloads a PDF of the generated report', async () => {
        const mockResult = { methodStatementDocument: '## PDF Content' };
        mockGenerateMethodStatement.mockResolvedValue(mockResult);
        const mockCanvas = document.createElement('canvas');
        mockHtml2canvas.mockResolvedValue(mockCanvas);
        
        render(<MethodStatementPage />);
        
        // Generate the document first
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

        fireEvent.click(screen.getByRole('button', { name: /Generate Method Statement/i }));
        
        const downloadButton = await screen.findByRole('button', { name: /Download as PDF/i });
        fireEvent.click(downloadButton);
        
        expect(await screen.findByRole('button', { name: /Downloading.../i })).toBeInTheDocument();
        
        await waitFor(() => {
            expect(mockHtml2canvas).toHaveBeenCalled();
            expect(mockJsPDF).toHaveBeenCalled();
            expect(mockSave).toHaveBeenCalledWith('Method-Statement-Test_Task.pdf');
        });
    });

    it('saves a generated statement to localStorage', async () => {
        const mockResult = { methodStatementDocument: '## Saved Content' };
        mockGenerateMethodStatement.mockResolvedValue(mockResult);

        const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
        jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('[]');

        render(<MethodStatementPage />);

        // Generate the document
        fireEvent.change(screen.getByLabelText(/Company Name/i), { target: { value: 'Save Co' } });
        fireEvent.change(screen.getByLabelText(/Project Title/i), { target: { value: 'Save Project' } });
        fireEvent.change(screen.getByLabelText(/Specific Task \/ Operation Title/i), { target: { value: 'Save Task' } });
        fireEvent.change(screen.getByLabelText(/Scope of Work/i), { target: { value: 'Test Scope' } });
        fireEvent.change(screen.getByLabelText(/Identified Hazards/i), { target: { value: 'Test Hazards' } });
        fireEvent.change(screen.getByLabelText(/Personal Protective Equipment \(PPE\)/i), { target: { value: 'Test PPE' } });
        fireEvent.change(screen.getByLabelText(/Equipment & Resources/i), { target: { value: 'Test Equipment' } });
        fireEvent.change(screen.getByPlaceholderText(/Step 1 description.../i), { target: { value: 'Test Procedure' } });
        fireEvent.change(screen.getByLabelText(/Training & Competency/i), { target: { value: 'Test Training' } });
        fireEvent.change(screen.getByLabelText(/Supervision & Monitoring/i), { target: { value: 'Test Monitoring' } });
        fireEvent.change(screen.getByLabelText(/Emergency Procedures/i), { target: { value: 'Test Emergency' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Generate Method Statement/i }));

        const saveButton = await screen.findByRole('button', { name: /Save Document/i });
        fireEvent.click(saveButton);

        expect(setItemSpy).toHaveBeenCalledWith(
            'savedMethodStatements',
            expect.stringContaining('"title":"Save Task"')
        );

        expect(mockToast).toHaveBeenCalledWith({
            title: 'Success',
            description: 'Method Statement "Save Task" has been saved.',
        });
    });
});
