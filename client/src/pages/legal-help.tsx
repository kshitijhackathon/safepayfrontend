import React, { useState, useRef, useEffect } from 'react';
import MainLayout from '@/layouts/main-layout';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  AlertCircle, 
  ArrowLeft, 
  Check,
  Copy,
  Mic,
  MicOff,
  Calendar,
  User,
  Mail,
  Phone,
  Home,
  Send,
  Loader2,
  Edit,
  ExternalLink
} from 'lucide-react';

// Legal resources with exact URLs
const legalResources = [
  {
    id: 1,
    title: 'File a Cyber Crime Complaint',
    description: 'Report financial frauds and cyber crimes to the National Cyber Crime Reporting Portal',
    link: 'https://cybercrime.gov.in'
  },
  {
    id: 2,
    title: 'Contact RBI Ombudsman',
    description: 'Escalate payment related complaints through the RBI Complaint Management System',
    link: 'https://cms.rbi.org.in/rbi/vividflow/run/rbi?language=Auto'
  },
  {
    id: 3,
    title: 'NPCI Dispute Management System',
    description: 'Raise disputes for UPI transactions through NPCI\'s Dispute Management System',
    link: 'https://www.npci.org.in/what-we-do/upi/dispute-redressal-mechanism'
  }
];

// Sample legal FAQ
const legalFaqs = [
  {
    id: 1,
    question: 'What should I do immediately after being scammed?',
    answer: 'First, contact your bank to report the unauthorized transaction and request blocking further transactions. Then file a complaint with the National Cyber Crime Reporting Portal (cybercrime.gov.in) or call the cyber crime helpline 1930 to report the fraud.'
  },
  {
    id: 2,
    question: 'Is there a time limit to report UPI fraud?',
    answer: 'Yes, report the fraud to your bank immediately. As per RBI guidelines, your liability may increase if you delay reporting beyond 3 working days. File a police complaint within 24 hours for better chances of fund recovery.'
  },
  {
    id: 3,
    question: 'Can I get my money back after a UPI scam?',
    answer: 'Recovery depends on how quickly you report and if the funds are still in the fraudster\'s account. Contact your bank immediately and file a complaint with the cyber crime portal. Banks may be able to freeze the beneficiary account if reported in time.'
  },
  {
    id: 4,
    question: 'How do I protect myself from UPI scams?',
    answer: 'Never share your UPI PIN, OTP, or banking credentials. Verify the receiver\'s details before making payments. Don\'t scan QR codes from unknown sources. Don\'t accept collect requests from unknown users. Regularly check your transaction history.'
  }
];

export default function LegalHelp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("resources");
  
  // Police complaint form state - User info
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress, setUserAddress] = useState('');
  
  // Police complaint form state - Scammer info
  const [scammerUpiId, setScammerUpiId] = useState('');
  const [scammerName, setScammerName] = useState('');
  const [amount, setAmount] = useState('');
  const [dateOfScam, setDateOfScam] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  // Form navigation and UI state
  const [formStep, setFormStep] = useState(1); // 1: User Info, 2: Scammer Info, 3: Description, 4: Preview Email
  const [showComplaintPreview, setShowComplaintPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  
  // State for email subject
  const [emailSubject, setEmailSubject] = useState('');
  
  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(' ');
        setDescription(prev => prev + ' ' + transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        toast({
          title: 'Speech recognition failed',
          description: event.error === 'no-speech' ? 'No speech detected. Please try again.' : 'Please try again or type your description manually',
          variant: 'destructive',
        });
        setIsRecording(false);
      };
    }
  }, []);
  
  // Refactor startRecording to use recognitionRef
  const startRecording = async () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Speech recognition not supported',
        description: 'Your browser does not support speech recognition. Please type your description.',
        variant: 'destructive',
      });
      return;
    }
    try {
      setIsRecording(true);
      setRecordingDuration(0);
      recognitionRef.current.start();
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast({
        title: 'Speech recognition failed',
        description: 'Please try again or type your description manually',
        variant: 'destructive',
      });
      setIsRecording(false);
    }
  };
  
  // Refactor stopRecording to use recognitionRef
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingDuration(0);
    }
  };
  
  // Clean up function for voice recording
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);
  
  // Format recording duration as mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} Copied`,
      description: `The ${type.toLowerCase()} has been copied to your clipboard.`,
    });
  };
  
  // Generate email and switch to preview
  const handleGenerateEmail = () => {
    if (!description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please provide a description of the fraud.",
        variant: "destructive",
      });
      return;
    }
    
    const subject = `Cyber Crime Complaint: ${scammerUpiId || 'N/A'}`;
    setEmailSubject(subject);
    
    // Construct email body with user and scammer details
    let body = `Dear Sir/Madam,\n\nI am writing to report a financial fraud that I have been a victim of. Below are the details of the incident:\n\n`;
    body += `--- VICTIM DETAILS ---\n`;
    body += `Full Name: ${userFullName || 'Not provided'}\n`;
    body += `Email: ${userEmail || 'Not provided'}\n`;
    body += `Phone: ${userPhone || 'Not provided'}\n`;
    body += `Address: ${userAddress || 'Not provided'}\n\n`;
    
    body += `--- SCAMMER DETAILS ---\n`;
    body += `Scammer UPI ID: ${scammerUpiId || 'Not provided'}\n`;
    body += `Scammer Name (if known): ${scammerName || 'Not provided'}\n`;
    body += `Amount: ₹${amount || 'Not provided'}\n`;
    body += `Date of Transaction: ${dateOfScam}\n\n`;
    
    body += `--- FRAUD DESCRIPTION ---\n`;
    body += `${description}\n\n`;
    
    body += `I request you to take immediate action and help me recover my funds. Thank you for your assistance.\n\n`;
    body += `Sincerely,\n${userFullName || 'A concerned citizen'}`;
    
    setGeneratedEmail(body);
    setShowComplaintPreview(true);
  };
  
  // Generate email using OpenAI
  const generateComplaintEmail = async () => {
    // Validate required fields
    const requiredFields = [
      { field: userFullName, name: 'Full Name' },
      { field: userEmail, name: 'Email' },
      { field: userPhone, name: 'Phone Number' },
      { field: userAddress, name: 'Address' },
      { field: scammerUpiId, name: 'Scammer UPI ID' },
      { field: amount, name: 'Fraud Amount' },
      { field: description, name: 'Description' }
    ];
    
    const missingFields = requiredFields.filter(({field}) => !field.trim());
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: `Please provide: ${missingFields.map(f => f.name).join(', ')}`,
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingEmail(true);
    
    try {
      const response = await fetch('/api/generate-complaint-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userFullName,
          userEmail,
          userPhone,
          userAddress,
          scammerUpiId,
          scammerName,
          amount,
          dateOfScam,
          description
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate complaint email');
      }
      
      const data = await response.json();
      
      if (data.success && data.emailContent) {
        setGeneratedEmail(data.emailContent);
        setShowComplaintPreview(true);
      } else {
        throw new Error('Failed to generate email content');
      }
    } catch (error) {
      console.error('Error generating email:', error);
      toast({
        title: "Email Generation Failed",
        description: "There was an error generating your complaint email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingEmail(false);
    }
  };
  
  // Handle form submission (sending email)
  const handleSubmitComplaint = async () => {
    setIsSubmitting(true);
    
    try {
      const complaintData = {
        userFullName,
        userEmail,
        userPhone,
        userAddress,
        scammerUpiId,
        scammerName,
        amount,
        dateOfScam,
        description
      };
      
      const response = await fetch('/api/send-complaint-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          complaintData,
          emailContent: generatedEmail
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send complaint email');
      }
      
      const data = await response.json();
      
      setSubmissionSuccess(true);
      toast({
        title: "Complaint Submitted",
        description: "Your complaint has been emailed to the Madhya Pradesh Police Cyber Cell. A copy has also been sent to your email address.",
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error sending your complaint. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form fields
  const resetForm = () => {
    // User info
    setUserFullName('');
    setUserEmail('');
    setUserPhone('');
    setUserAddress('');
    
    // Scammer info
    setScammerUpiId('');
    setScammerName('');
    setAmount('');
    setDateOfScam(new Date().toISOString().split('T')[0]);
    setDescription('');
    
    // UI state
    setFormStep(1);
    setShowComplaintPreview(false);
    setSubmissionSuccess(false);
    setGeneratedEmail('');
    setIsEditingEmail(false);
    setEmailSubject('');
  };
  
  const renderResourcesTab = () => (
    <>
      <h2 className="text-lg font-semibold mb-4">Need Immediate Help?</h2>
      <Card className="p-4 rounded-xl mb-6 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium mb-1">Report to Cyber Crime Helpline</h3>
            <p className="text-sm text-gray-600 mb-2">For immediate assistance with financial fraud</p>
          </div>
          <a href="tel:1930" className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm">
            Call 1930
          </a>
        </div>
      </Card>
      
      <h2 className="text-lg font-semibold mb-4">Legal Resources</h2>
      <div className="flex flex-col gap-4 mb-6">
        {legalResources.map(resource => (
          <Card key={resource.id} className="p-4 rounded-xl">
            <h3 className="font-medium mb-1">{resource.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
            <a href={resource.link} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button variant="outline" className="w-full border-primary text-primary">
                Visit Website
              </Button>
            </a>
          </Card>
        ))}
      </div>
      
      <h2 className="text-lg font-semibold mb-4">Legal FAQs</h2>
      <Accordion type="single" collapsible className="mb-6">
        {legalFaqs.map(faq => (
          <AccordionItem key={faq.id} value={`item-${faq.id}`}>
            <AccordionTrigger className="text-left font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-gray-600">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      <div className="flex flex-col gap-3">
        <Button 
          onClick={() => setActiveTab("file-complaint")}
          className="w-full bg-primary text-white"
        >
          File Police Complaint
        </Button>
        
        <Button 
          onClick={() => setLocation('/report-scam')}
          variant="outline"
          className="w-full border-primary text-primary"
        >
          Report a Scam
        </Button>
      </div>
    </>
  );
  
  const renderComplaintForm = () => {
    if (submissionSuccess) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Complaint Submitted!</h2>
          <p className="text-center text-gray-600 mb-6">
            Your complaint has been successfully emailed to the Madhya Pradesh Police Cyber Cell. 
            A copy has also been sent to your email address for your records.
          </p>
          <Button onClick={resetForm} className="w-full bg-primary text-white mb-3">
            File Another Complaint
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              resetForm();
              setActiveTab("resources");
            }}
            className="w-full"
          >
            Back to Resources
          </Button>
        </div>
      );
    }
    
    return showComplaintPreview ? (
      <div>
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 mr-2" 
            onClick={() => setShowComplaintPreview(false)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Email Preview</h2>
        </div>
        
        {isEditingEmail ? (
          <div className="mb-4">
            <Textarea
              className="font-mono text-sm h-[400px] mb-4"
              value={generatedEmail}
              onChange={(e) => setGeneratedEmail(e.target.value)}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditingEmail(false)}
              className="mb-4"
            >
              <Check className="h-4 w-4 mr-2" />
              Done Editing
            </Button>
          </div>
        ) : (
          <Card className="mb-6">
            <div className="flex justify-between items-center p-3 border-b">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">To:</span> adg-cybercell@mppolice.gov.in
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditingEmail(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
            <div className="p-3 border-b">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Subject:</span> UPI Fraud Complaint: {scammerUpiId}
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-sm p-4 bg-gray-50 rounded-b-lg max-h-[350px] overflow-y-auto">
              {generatedEmail}
            </pre>
          </Card>
        )}
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => handleCopyToClipboard("adg-cybercell@mppolice.gov.in", "Email Address")}
            variant="outline"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Recipient Email
          </Button>
          <Button 
            onClick={() => handleCopyToClipboard(emailSubject, "Subject")}
            variant="outline"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Subject
          </Button>
          <Button 
            onClick={() => handleCopyToClipboard(generatedEmail, "Email Body")}
            className="w-full bg-primary text-white"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Email Content
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowComplaintPreview(false)}
            className="w-full"
          >
            Edit Details
          </Button>
        </div>
      </div>
    ) : (
      <div>
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 mr-2" 
            onClick={() => setActiveTab("resources")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">File Police Complaint</h2>
        </div>
        
        <Card className="p-5 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700 rounded-lg p-3 mb-4 flex items-start transition-colors">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700 dark:text-yellow-200">
              This will generate an official complaint email to the Madhya Pradesh Police Cyber Cell. 
              Please provide accurate information for proper investigation.
            </p>
          </div>
          
          {/* Form Steps Navigation */}
          <div className="flex mb-6">
            <div 
              className={`flex-1 py-2 text-center relative font-medium text-sm ${formStep === 1 ? 'text-primary border-b-2 border-primary' : 'text-gray-500 cursor-pointer'}`} 
              onClick={() => formStep > 1 && setFormStep(1)}
            >
              1. Your Details
            </div>
            <div 
              className={`flex-1 py-2 text-center relative font-medium text-sm ${formStep === 2 ? 'text-primary border-b-2 border-primary' : 'text-gray-500 cursor-pointer'}`}
              onClick={() => formStep > 2 && setFormStep(2)}
            >
              2. Scammer Details
            </div>
            <div 
              className={`flex-1 py-2 text-center relative font-medium text-sm ${formStep === 3 ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            >
              3. Description
            </div>
          </div>
          
          {/* Form Step 1: Your Information */}
          {formStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-full-name" className="text-sm text-gray-500">
                  <User className="h-4 w-4 inline mr-1" />
                  Your Full Name
                </Label>
                <Input
                  id="user-full-name"
                  type="text"
                  value={userFullName}
                  onChange={(e) => setUserFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="user-email" className="text-sm text-gray-500">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Your Email
                </Label>
                <Input
                  id="user-email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="e.g. rahul.sharma@gmail.com"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="user-phone" className="text-sm text-gray-500">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Your Phone Number
                </Label>
                <Input
                  id="user-phone"
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="user-address" className="text-sm text-gray-500">
                  <Home className="h-4 w-4 inline mr-1" />
                  Your Address
                </Label>
                <Textarea
                  id="user-address"
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  placeholder="Your full current address"
                  className="mt-1"
                  required
                />
              </div>
              
              <Button 
                onClick={() => setFormStep(2)}
                className="w-full bg-primary text-white mt-2"
                disabled={!userFullName || !userEmail || !userPhone || !userAddress}
              >
                Next Step
              </Button>
            </div>
          )}
          
          {/* Form Step 2: Scammer Information */}
          {formStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="scammer-upi-id" className="text-sm text-gray-500">Scammer's UPI ID</Label>
                <Input
                  id="scammer-upi-id"
                  type="text"
                  value={scammerUpiId}
                  onChange={(e) => setScammerUpiId(e.target.value)}
                  placeholder="e.g. fraudster@okaxis"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="scammer-name" className="text-sm text-gray-500">Scammer's Name (if known)</Label>
                <Input
                  id="scammer-name"
                  type="text"
                  value={scammerName}
                  onChange={(e) => setScammerName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="fraud-amount" className="text-sm text-gray-500">Fraud Amount (₹)</Label>
                <Input
                  id="fraud-amount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="date-of-scam" className="text-sm text-gray-500">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date of Fraud
                </Label>
                <Input
                  id="date-of-scam"
                  type="date"
                  value={dateOfScam}
                  onChange={(e) => setDateOfScam(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setFormStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                
                <Button 
                  onClick={() => setFormStep(3)}
                  className="flex-1 bg-primary text-white"
                  disabled={!scammerUpiId || !amount}
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}
          
          {/* Form Step 3: Description with Voice Input */}
          {formStep === 3 && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="fraud-description" className="text-sm text-gray-500">
                    Fraud Description
                  </Label>
                  
                  {/* Voice recording button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={isRecording ? "animate-pulse bg-red-50 text-red-500 border-red-200" : ""}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop Recording ({formatDuration(recordingDuration)})
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Voice Input
                      </>
                    )}
                  </Button>
                </div>
                
                <Textarea
                  id="fraud-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe how the fraud happened in detail. Include how you were contacted, what was promised, how the payment was made, etc."
                  className="mt-1"
                  rows={8}
                  required
                />
                
                <p className="text-xs text-gray-500 mt-1">
                  You can use the voice input button to dictate your description.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setFormStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                
                <Button 
                  onClick={handleGenerateEmail}
                  className="flex-1 bg-primary text-white"
                  disabled={!description || isGeneratingEmail}
                >
                  {isGeneratingEmail ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Generate Email
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Legal Help & Resources</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="resources" className="flex-1">Resources</TabsTrigger>
            <TabsTrigger value="file-complaint" className="flex-1">File Complaint</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resources">
            {renderResourcesTab()}
          </TabsContent>
          
          <TabsContent value="file-complaint">
            {renderComplaintForm()}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}