import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, File } from "lucide-react";

const safetyDocs = {
  "Safety Manual": ["Company Safety Manual v1.2"],
  "Safety Policies & Procedures": ["General Safety Policy", "Working from Home Policy"],
  "Risk Assessments (HIRA)": ["General Office Risk Assessment", "Construction Site HIRA Template"],
  "Safe Work Procedures (SWP)": ["Manual Handling SWP", "Lockout/Tagout SWP"],
  "Method Statements": ["Installation of HV Equipment"],
  "Incident Reports & Investigations": ["Incident Report Form", "Investigation Template"],
  "Emergency Plans": ["Fire Evacuation Plan", "Medical Emergency Response"],
  "Toolbox Talks & Meeting Minutes": ["Weekly Safety Meeting Record"],
  "Legal & Other Appointments": ["CEO Appointment Letter"],
  "Registers & Checklists": ["First Aid Box Register", "Fire Extinguisher Checklist"],
  "Fall Protection & Working at Heights": ["Fall Protection Plan"],
  "Gap Assessments (ISO 45001, Client-specific)": ["ISO 45001 Gap Assessment Checklist"],
  "Legal Compliance Audit Reports": ["OHS Act Compliance Audit Report 2023"],
  "Internal Audit Plan": ["Internal Audit Schedule 2024"],
  "Internal Audit Reports": ["Q1 Internal Audit Report"],
};

const environmentalDocs = {
  "Environmental Manual": ["Environmental Management Manual"],
  "Environmental Policy": ["Company Environmental Policy"],
  "Impact Assessments": ["New Development EIA Report"],
  "Waste Management Plans": ["Hazardous Waste Management Plan"],
  "Environmental Incident Reports": ["Chemical Spill Report Form"],
  "Environmental Inspection Checklist": ["Site Environmental Checklist"],
};

const qualityDocs = {
  "Quality Manual": ["ISO 9001 Quality Manual"],
  "Quality Policy": ["Company Quality Policy"],
  "Quality Procedures & Work Instructions": ["Document Control Procedure"],
  "Audit Reports (Internal & External)": ["External Audit Report 2023"],
  "Non-conformance & Corrective Actions": ["NCR Form"],
  "Management Reviews": ["Management Review Meeting Minutes"],
  "Client & Supplier": ["Supplier Evaluation Form"],
  "Quality Control Checklists": ["Final Product Inspection Checklist"],
  "Tool & Equipment Inspection Logs": ["Crane Inspection Log"],
};

const hrDocs = {
  "HR Policies & Procedures": ["Employee Handbook"],
  "General Appointments": ["Appointment Letter Template"],
  "Hiring Policy": ["Recruitment and Selection Policy"],
  "Company Property Policy": ["Asset Usage Policy"],
  "Performance Management": ["Performance Review Form"],
  "Disciplinary & Grievance": ["Disciplinary Code", "Grievance Form"],
  "Leave Request Forms": ["Annual Leave Request Form"],
  "Employment Contracts & Agreements": ["Permanent Employment Contract Template"],
  "Warning Templates": ["Verbal Warning Template", "Written Warning Template"],
};

type DocCategory = typeof safetyDocs;

const DocumentList = ({ category }: { category: DocCategory }) => (
  <Accordion type="multiple" className="w-full">
    {Object.entries(category).map(([subSection, docs]) => (
      <AccordionItem value={subSection} key={subSection}>
        <AccordionTrigger>{subSection}</AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-2 pl-4">
            {docs.map((doc) => (
              <li key={doc} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <File className="size-4 text-muted-foreground" />
                  <span>{doc}</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="mr-2 size-4" />
                  Download
                </Button>
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
