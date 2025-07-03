import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, File } from "lucide-react";

interface Doc {
  name: string;
  fileType: string;
  fileSize: string;
  lastModified: string;
}

interface DocCategory {
  [subSection: string]: Doc[];
}

const safetyDocs: DocCategory = {
  "Safety Manual": [{ name: 'Company Safety Manual v1.2', fileType: 'PDF', fileSize: '2.4 MB', lastModified: '2024-05-15' }],
  "Safety Policies & Procedures": [
    { name: 'General Safety Policy', fileType: 'PDF', fileSize: '350 KB', lastModified: '2023-11-20' },
    { name: 'Working from Home Policy', fileType: 'Word', fileSize: '120 KB', lastModified: '2024-01-30' },
  ],
  "Risk Assessments (HIRA)": [
      { name: 'General Office Risk Assessment', fileType: 'Excel', fileSize: '88 KB', lastModified: '2024-06-01' },
      { name: 'Construction Site HIRA Template', fileType: 'PDF', fileSize: '450 KB', lastModified: '2023-09-05' }
  ],
  "Safe Work Procedures (SWP)": [
      { name: 'Manual Handling SWP', fileType: 'PDF', fileSize: '210 KB', lastModified: '2024-02-11' },
      { name: 'Lockout/Tagout SWP', fileType: 'PDF', fileSize: '315 KB', lastModified: '2024-03-22' }
  ],
  "Method Statements": [{ name: 'Installation of HV Equipment', fileType: 'Word', fileSize: '680 KB', lastModified: '2024-04-18' }],
  "Incident Reports & Investigations": [
      { name: 'Incident Report Form', fileType: 'PDF', fileSize: '150 KB', lastModified: '2023-05-01' },
      { name: 'Investigation Template', fileType: 'Word', fileSize: '95 KB', lastModified: '2023-05-02' }
  ],
  "Emergency Plans": [
      { name: 'Fire Evacuation Plan', fileType: 'PDF', fileSize: '1.2 MB', lastModified: '2024-01-10' },
      { name: 'Medical Emergency Response', fileType: 'PDF', fileSize: '850 KB', lastModified: '2024-01-12' }
  ],
  "Toolbox Talks & Meeting Minutes": [{ name: 'Weekly Safety Meeting Record', fileType: 'Excel', fileSize: '55 KB', lastModified: '2024-07-01' }],
  "Legal & Other Appointments": [{ name: 'CEO Appointment Letter', fileType: 'PDF', fileSize: '90 KB', lastModified: '2022-01-01' }],
  "Registers & Checklists": [
      { name: 'First Aid Box Register', fileType: 'Excel', fileSize: '45 KB', lastModified: '2024-07-01' },
      { name: 'Fire Extinguisher Checklist', fileType: 'PDF', fileSize: '180 KB', lastModified: '2024-06-28' }
  ],
  "Fall Protection & Working at Heights": [{ name: 'Fall Protection Plan', fileType: 'PDF', fileSize: '950 KB', lastModified: '2024-03-01' }],
  "Gap Assessments (ISO 45001, Client-specific)": [{ name: 'ISO 45001 Gap Assessment Checklist', fileType: 'Excel', fileSize: '250 KB', lastModified: '2023-10-15' }],
  "Legal Compliance Audit Reports": [{ name: 'OHS Act Compliance Audit Report 2023', fileType: 'PDF', fileSize: '3.1 MB', lastModified: '2023-12-01' }],
  "Internal Audit Plan": [{ name: 'Internal Audit Schedule 2024', fileType: 'Word', fileSize: '75 KB', lastModified: '2024-02-01' }],
  "Internal Audit Reports": [{ name: 'Q1 Internal Audit Report', fileType: 'PDF', fileSize: '450 KB', lastModified: '2024-04-05' }],
};

const environmentalDocs: DocCategory = {
  "Environmental Manual": [{ name: 'Environmental Management Manual', fileType: 'PDF', fileSize: '1.8 MB', lastModified: '2023-08-20' }],
  "Environmental Policy": [{ name: 'Company Environmental Policy', fileType: 'PDF', fileSize: '200 KB', lastModified: '2023-01-15' }],
  "Impact Assessments": [{ name: 'New Development EIA Report', fileType: 'PDF', fileSize: '5.5 MB', lastModified: '2022-11-30' }],
  "Waste Management Plans": [{ name: 'Hazardous Waste Management Plan', fileType: 'Word', fileSize: '400 KB', lastModified: '2024-02-28' }],
  "Environmental Incident Reports": [{ name: 'Chemical Spill Report Form', fileType: 'PDF', fileSize: '130 KB', lastModified: '2023-04-10' }],
  "Environmental Inspection Checklist": [{ name: 'Site Environmental Checklist', fileType: 'Excel', fileSize: '60 KB', lastModified: '2024-06-15' }],
};

const qualityDocs: DocCategory = {
  "Quality Manual": [{ name: 'ISO 9001 Quality Manual', fileType: 'PDF', fileSize: '2.1 MB', lastModified: '2023-07-01' }],
  "Quality Policy": [{ name: 'Company Quality Policy', fileType: 'PDF', fileSize: '180 KB', lastModified: '2023-01-15' }],
  "Quality Procedures & Work Instructions": [{ name: 'Document Control Procedure', fileType: 'Word', fileSize: '300 KB', lastModified: '2023-02-10' }],
  "Audit Reports (Internal & External)": [{ name: 'External Audit Report 2023', fileType: 'PDF', fileSize: '1.5 MB', lastModified: '2023-11-05' }],
  "Non-conformance & Corrective Actions": [{ name: 'NCR Form', fileType: 'Excel', fileSize: '90 KB', lastModified: '2023-03-01' }],
  "Management Reviews": [{ name: 'Management Review Meeting Minutes', fileType: 'PDF', fileSize: '600 KB', lastModified: '2024-05-20' }],
  "Client & Supplier": [{ name: 'Supplier Evaluation Form', fileType: 'Word', fileSize: '150 KB', lastModified: '2024-01-10' }],
  "Quality Control Checklists": [{ name: 'Final Product Inspection Checklist', fileType: 'PDF', fileSize: '220 KB', lastModified: '2024-06-18' }],
  "Tool & Equipment Inspection Logs": [{ name: 'Crane Inspection Log', fileType: 'Excel', fileSize: '120 KB', lastModified: '2024-07-01' }],
};

const hrDocs: DocCategory = {
  "HR Policies & Procedures": [{ name: 'Employee Handbook', fileType: 'PDF', fileSize: '1.1 MB', lastModified: '2024-01-01' }],
  "General Appointments": [{ name: 'Appointment Letter Template', fileType: 'Word', fileSize: '80 KB', lastModified: '2023-01-10' }],
  "Hiring Policy": [{ name: 'Recruitment and Selection Policy', fileType: 'PDF', fileSize: '250 KB', lastModified: '2023-02-15' }],
  "Company Property Policy": [{ name: 'Asset Usage Policy', fileType: 'PDF', fileSize: '180 KB', lastModified: '2023-03-20' }],
  "Performance Management": [{ name: 'Performance Review Form', fileType: 'Word', fileSize: '110 KB', lastModified: '2024-06-01' }],
  "Disciplinary & Grievance": [
    { name: 'Disciplinary Code', fileType: 'PDF', fileSize: '350 KB', lastModified: '2023-04-01' },
    { name: 'Grievance Form', fileType: 'Word', fileSize: '70 KB', lastModified: '2023-04-01' }
  ],
  "Leave Request Forms": [{ name: 'Annual Leave Request Form', fileType: 'PDF', fileSize: '60 KB', lastModified: '2023-01-01' }],
  "Employment Contracts & Agreements": [{ name: 'Permanent Employment Contract Template', fileType: 'Word', fileSize: '150 KB', lastModified: '2023-01-10' }],
  "Warning Templates": [
    { name: 'Verbal Warning Template', fileType: 'Word', fileSize: '50 KB', lastModified: '2023-02-01' },
    { name: 'Written Warning Template', fileType: 'Word', fileSize: '55 KB', lastModified: '2023-02-01' }
  ],
};


const DocumentList = ({ category }: { category: DocCategory }) => (
  <Accordion type="multiple" className="w-full">
    {Object.entries(category).map(([subSection, docs]) => (
      <AccordionItem value={subSection} key={subSection}>
        <AccordionTrigger>{subSection}</AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-2 pl-4">
            {docs.map((doc) => (
              <li key={doc.name}>
                <TooltipProvider>
                    <Tooltip>
                        <div className="flex items-center justify-between">
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-default">
                                    <File className="size-4 text-muted-foreground" />
                                    <span>{doc.name}</span>
                                </div>
                            </TooltipTrigger>
                            <Button variant="ghost" size="sm">
                                <Download className="mr-2 size-4" />
                                Download
                            </Button>
                        </div>
                        <TooltipContent>
                           <div className="text-sm space-y-1 p-1">
                                <p><strong>File Type:</strong> {doc.fileType}</p>
                                <p><strong>File Size:</strong> {doc.fileSize}</p>
                                <p><strong>Last Modified:</strong> {doc.lastModified}</p>
                           </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

export default function DocumentsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Document Library
        </h1>
        <p className="text-muted-foreground">
          Access all your company documents in one place.
        </p>
      </header>
      <Tabs defaultValue="safety" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="hr">HR</TabsTrigger>
        </TabsList>
        <TabsContent value="safety">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Safety Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentList category={safetyDocs} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="environmental">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Environmental Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentList category={environmentalDocs} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Quality Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentList category={qualityDocs} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="hr">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">HR Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentList category={hrDocs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
