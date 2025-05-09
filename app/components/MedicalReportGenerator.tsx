"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";

// Interface for a single topic's definition
interface TopicDefinition {
  title: string;
  notes: string;
}

// Interface for the entire collection of topics, keyed by ID
interface TopicsData {
  [id: string]: TopicDefinition;
}

// Doctor and Scribe interfaces remain the same
interface Doctor {
  id: string;
  name: string;
  docImage: string; // Added to hold the image path
}

interface Scribe {
  id: string;
  name: string;
  email: string;
}

// Sample data for Doctors and Scribes
const DOCTORS: Doctor[] = [
  { id: "doc1", name: "Dr. Joe Hoja", docImage: "/doctorpics/joe.jpg" },
  { id: "doc2", name: "Dr. Alexander Jobe", docImage: "/doctorpics/ally.jpg" },
  { id: "doc3", name: "Dr. Bella Sudit", docImage: "/doctorpics/bella.jpg" },
  { id: "doc4", name: "Dr. Trudy Gibson", docImage: "/doctorpics/trudy.jpg" },
  { id: "doc5", name: "Dr. Junqon Jung", docImage: "/doctorpics/jj.jpg" },
];

const SCRIBES: Scribe[] = [
  { id: "scribe1", name: "Kelly", email: "Kelly@PeterboroughOptometric.com" },
  { id: "scribe2", name: "Amanda", email: "Amanda@PeterboroughOptometric.com" },
];

// Updated TOPICS structure as per your request
const TOPICS: TopicsData = {
  dryEyes: {
    title: "Dry Eyes",
    notes:
      "You reported symptoms consistent with dry eyes, including [e.g., irritation, gritty feeling, intermittent blurry vision]. This condition occurs when your eyes don't produce enough tears or the right quality of tears to stay adequately lubricated.\n\nWe discussed several ways to manage this:\n- Using artificial tears [e.g., 3-4 times a day or as needed] to supplement moisture.\n- Taking regular breaks from screen time (e.g., the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds).\n- Considering the use of a humidifier in dry indoor environments.\n- Avoiding direct exposure to fans, air conditioning vents, or very windy conditions.\n\nWe will continue to monitor your symptoms and the effectiveness of these measures at your next visit. Please let us know if your symptoms worsen or do not improve.",
  },
  refractiveError: {
    title: "Refractive Error / New Prescription",
    notes:
      "Your vision examination today revealed a refractive error. This means the shape of your eye doesn't bend light correctly, leading to blurred vision at certain distances.\n- We discussed various lens options, including [e.g., anti-reflective coating, blue light filters, progressive lenses].\n- Ensure you have good lighting when reading or performing detailed tasks.",
  },
  glaucomaRisk: {
    title: "Glaucoma Evaluation / Risk Assessment",
    notes:
      "As part of your comprehensive eye exam, we evaluated you for glaucoma, a condition that can damage the optic nerve, often without early symptoms. Your intraocular pressures today were: OD [XX] mmHg, OS [XX] mmHg. Examination of your optic nerves showed [e.g., healthy appearance, specific findings like cupping ratio].\n\nBased on these findings and your risk factors [e.g., family history, age, race, corneal thickness if measured]:\n- [e.g., No current signs of glaucoma were detected. We will continue routine monitoring.]\n- [e.g., You have certain risk factors, and we recommend continued monitoring every [X] months/year, possibly with additional tests like visual fields or OCT scans in the future.]\n- [e.g., We noted suspicious findings and will schedule further testing to investigate.]\n\nEarly detection is key in managing glaucoma. Please adhere to the recommended follow-up schedule.",
  },
  amdScreening: {
    title: "Age-related Macular Degeneration (AMD) Screening",
    notes:
      "We screened for Age-related Macular Degeneration (AMD), a condition affecting central vision, which is more common with age. Your retinal examination showed [e.g., no signs of AMD / early signs such as drusen / specific findings].\n\nRecommendations:\n- [e.g., Currently, your maculae appear healthy.]\n- [e.g., We observed early signs of AMD (drusen). At this stage, we recommend lifestyle modifications such as a diet rich in leafy greens, fish, and nuts, UV protection, and smoking cessation if applicable.]\n- [e.g., We will monitor these findings closely. An Amsler grid may be provided for home monitoring.]\n\nRegular eye exams are important for monitoring any changes related to AMD.",
  },
  diabeticRetinopathyScreening: {
    title: "Diabetic Retinopathy Screening",
    notes:
      "Given your history of diabetes, a dilated retinal examination was performed to screen for diabetic retinopathy. This condition affects the blood vessels in the retina. Today's examination revealed [e.g., no signs of diabetic retinopathy / mild non-proliferative diabetic retinopathy with microaneurysms / other findings].\n\nRecommendations:\n- It is crucial to maintain good control of your blood sugar (HbA1c), blood pressure, and cholesterol levels.\n- [e.g., We recommend continued annual diabetic eye examinations.]\n- [e.g., Due to the findings, we recommend a follow-up in [X] months or a referral to a retinal specialist if indicated.]\n\nConsistent management of your diabetes and regular eye exams are vital to protect your vision.",
  },
  cataractsEvaluation: {
    title: "Cataract Evaluation",
    notes:
      "We evaluated the lenses of your eyes for cataracts, which are a common age-related clouding of the eye's natural lens. Your examination showed [e.g., no significant cataracts / early cataracts in one/both eyes / moderate cataracts affecting vision].\n\nImpact on Vision: [e.g., Currently, the cataracts are not significantly impacting your vision or daily activities. / You reported symptoms like glare, halos, or difficulty with night driving, which may be related to your cataracts.]\n\nRecommendations:\n- [e.g., No specific action is needed at this time. We will monitor their progression at future exams.]\n- [e.g., An updated glasses prescription may help improve vision temporarily.]\n- [e.g., If your vision becomes significantly impaired, cataract surgery is an effective option to restore clarity. We can discuss this further if and when it becomes necessary.]",
  },
};

interface ReportData {
  patientName: string;
  dateOfVisit: string;
  doctorName: string;
  doctorImage: string;
  scribeName?: string;
  scribeEmail?: string;
  topicTitles: string; // Combined titles of selected topics
  reportContent: string; // Combined notes from selected topics
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
}

interface MedicalReportGeneratorProps {}

const MedicalReportGenerator: React.FC<MedicalReportGeneratorProps> = () => {
  const [patientName, setPatientName] = useState<string>("");
  const [dateOfVisit, setDateOfVisit] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(DOCTORS[0]?.id || "");
  const [selectedScribe, setSelectedScribe] = useState<string>(SCRIBES[0]?.id || ""); // Default to first scribe or empty
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]); // Stores IDs of selected topics
  const [code, setCode] = useState<string>("Please select one or more topics to generate a report summary."); // Combined notes for editing
  const [error, setError] = useState<string>("");
  const [generatedReportData, setGeneratedReportData] = useState<ReportData | null>(null);

  const [docImageSrc, setDocImageSrc] = useState<string>("/doctorpics/face1.jpg"); // default image

  const reportPreviewRef = useRef<HTMLDivElement>(null);

  // Effect to update the 'code' textarea when selectedTopics change
  useEffect(() => {
    if (selectedTopics.length > 0) {
      const combinedNotes = selectedTopics
        .map((topicId) => {
          const topic = TOPICS[topicId];
          // Ensure topic exists and has a title and notes
          return topic ? `**${topic.title}**\n${topic.notes}\n` : "";
        })
        .filter((notes) => notes) // Remove any empty strings if a topicId was invalid
        .join("\n---\n\n"); // Separator between topics for readability in textarea
      setCode(combinedNotes);
    } else {
      setCode("Please select one or more topics to generate a report summary.");
    }
    setGeneratedReportData(null); // Clear previous report when topic selection changes
  }, [selectedTopics]);

  const handlePatientNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPatientName(e.target.value);
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDateOfVisit(e.target.value);
  };

  const handleDoctorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedDoctor(e.target.value);
    setGeneratedReportData(null);
  };

  const handleScribeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedScribe(e.target.value);
    setGeneratedReportData(null);
  };

  // Handles changes to topic checkboxes
  const handleTopicCheckboxChange = (topicId: string, checked: boolean) => {
    setSelectedTopics((prevSelectedTopics) => {
      if (checked) {
        // Add topicId if not already present
        return prevSelectedTopics.includes(topicId) ? prevSelectedTopics : [...prevSelectedTopics, topicId];
      } else {
        // Remove topicId
        return prevSelectedTopics.filter((id) => id !== topicId);
      }
    });
  };

  const handleCodeChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // if (!patientName.trim()) {
    //   setError('Please enter patient name.');
    //   return;
    // }
    if (!dateOfVisit) {
      setError("Please select a date of visit.");
      return;
    }
    if (!selectedDoctor) {
      setError("Please select a doctor.");
      return;
    }
    if (selectedTopics.length === 0) {
      setError("Please select at least one topic.");
      return;
    }
    if (!code.trim() || code === "Please select one or more topics to generate a report summary.") {
      setError("Report content cannot be empty. Please fill in or ensure topics are selected.");
      return;
    }

    const selectedTopicDetails = selectedTopics.map((id) => TOPICS[id]).filter(Boolean);
    const topicTitles = selectedTopicDetails.map((t) => t.title).join(", ");

    const reportData: ReportData = {
      patientName,
      dateOfVisit,
      doctorName: DOCTORS.find((d) => d.id === selectedDoctor)?.name || "N/A",
      doctorImage: DOCTORS.find((d) => d.id === selectedDoctor)?.docImage || "face1.jpg",
      scribeName: SCRIBES.find((s) => s.id === selectedScribe)?.name || undefined,
      scribeEmail: SCRIBES.find((s) => s.id === selectedScribe)?.email || undefined,
      topicTitles: topicTitles,
      reportContent: code, // 'code' now holds the combined, possibly edited, notes
      clinicName: "Peterborough Optometric",
      clinicAddress: "1090 Clonsilla Ave, Peterborough, ON K9J 5Y5, Canada",
      clinicPhone: "(705)749-5402",
    };
    setGeneratedReportData(reportData);
  };

  const handlePrintReport = () => {
    const printContents = reportPreviewRef.current?.innerHTML;
    // Assuming docImageSrc is already defined and is a string
    // Assuming patientName is already defined and is a string

    if (printContents && docImageSrc) {
      // Added check for docImageSrc for robustness
      const prepareForPrinting = async () => {
        try {
          const img = new Image();
          img.crossOrigin = "Anonymous";

          // Explicitly type the Promise to resolve with a string
          const imageLoadPromise = new Promise<string>((resolve, reject) => {
            img.onload = () => {
              try {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                  // Always good to check if getContext returned null
                  reject(new Error("Failed to get canvas context"));
                  return;
                }
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL("image/jpeg");
                resolve(dataUrl);
              } catch (error) {
                reject(error);
              }
            };
            img.onerror = (err) => reject(new Error(`Failed to load doctor image: ${err}`)); // err can provide more context
          });

          img.src = docImageSrc;

          // Now, imageDataUrl will be correctly inferred as 'string'
          const imageDataUrl: string = await imageLoadPromise;

          // Ensure docImageSrc is a string before using it in replace
          // (TypeScript might already enforce this if docImageSrc is properly typed)
          let processedContents = printContents.replace(docImageSrc as string, imageDataUrl);

          const printWindow = window.open("", "_blank");
          if (printWindow) {
            printWindow.document.write(`
                <html>
                  <head>
                    <title>Patient Eye Exam Summary - ${patientName}</title>
                    <style>
                      @media print {
                        @page { size: portrait; margin: 0.75in; }
                        body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.6; }
                        .report-header { text-align: center; margin-bottom: 25px; }
                        .report-header h1 { font-size: 26px; color: #2c5282; }
                        .patient-info p, .provider-info p { font-size: 14px; }
                        .provider-info {
                          display: flex;
                          align-items: center;
                          gap: 12px;
                          margin-bottom: 12px;
                        }
                        .provider-info img {
                          width: 80px;
                          height: 80px;
                          border-radius: 50%;
                          object-fit: cover;
                          border: 1px solid #ccc;
                        }
                        .provider-info p {
                          margin: 0;
                          font-size: 14px;
                        }
                      }
                    </style>
                  </head>
                  <body>${processedContents}</body>
                </html>
              `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
              printWindow.print();
            }, 500);
          } else {
            alert("Could not open print window. Please check your browser's popup settings.");
          }
        } catch (error) {
          console.error("Error preparing document for printing:", error);
          alert("There was an error preparing the document for printing. Please try again.");
          // Fallback printing logic (ensure patientName and printContents are accessible here if needed)
          const fallbackPrintWindow = window.open("", "_blank");
          if (fallbackPrintWindow) {
            fallbackPrintWindow.document.write(`
              <html>
                <head>
                  <title>Patient Eye Exam Summary - ${patientName}</title>
                  <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.6; }
                    /* Add essential styles for fallback */
                  </style>
                </head>
                <body>${printContents}</body> {/* Using original printContents for fallback */}
              </html>
            `);
            fallbackPrintWindow.document.close();
            fallbackPrintWindow.focus();
            fallbackPrintWindow.print();
          }
        }
      };

      prepareForPrinting();
    }
  };

  const RenderPatientReport: React.FC<{ data: ReportData }> = ({ data }) => {
    const processContentForDisplay = (content: string) => {
      return content.split("\n").map((line, index) => {
        if (line.trim() === "---") {
          return (
            <hr
              key={index}
              className="my-6 border-gray-300 dark:border-gray-600 print-separator"
            />
          );
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <strong
              key={index}
              className="block mt-4 mb-2 text-md font-semibold text-gray-800 dark:text-gray-200 topic-title-print">
              {line.substring(2, line.length - 2)}
            </strong>
          );
        }
        if (line.match(/^(\s*)(-|\*|\d+\.)\s+/)) {
          // Matches list items with optional leading spaces
          const Match = line.match(/^(\s*)(-|\*|\d+\.)\s+(.*)/);
          if (Match) {
            return (
              <li
                key={index}
                className="ml-6 list-disc text-gray-700 dark:text-gray-300 topic-notes-print list-item-print">
                {Match[3]}
              </li>
            );
          }
        }
        // For regular lines of text within notes
        if (line.trim() !== "") {
          return (
            <p
              key={index}
              className="text-gray-700 dark:text-gray-300 topic-notes-print">
              {line}
            </p>
          );
        }
        return null; // Avoid rendering empty lines as <br> or <p> unless specifically intended
      });
    };

    return (
      <div
        ref={reportPreviewRef}
        className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="report-header text-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{data.clinicName || "Eye Exam Summary"}</h1>
          {data.clinicAddress && <p className="text-sm text-gray-600 dark:text-gray-400">{data.clinicAddress}</p>}
          {data.clinicPhone && <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {data.clinicPhone}</p>}
        </div>

        <hr className="my-5 border-gray-300 dark:border-gray-600" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-3 text-sm patient-info">
          <p>
            <strong>Patient:</strong> {data.patientName}
          </p>
          <p>
            <strong>Date of Visit:</strong>{" "}
            {new Date(data.dateOfVisit + "T00:00:00Z").toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-5 text-sm provider-info">
          <div className="flex items-center gap-4">
            <img
              src={data.doctorImage}
              alt="Doctor"
              className="w-16 h-16 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
            />
            <p>
              <strong>Doctor:</strong> {data.doctorName}
            </p>
          </div>
          {data.scribeName && (
            <p>
              <strong>Scribe:</strong> {data.scribeName}
            </p>
          )}
        </div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-1 section-title">Summary of Your Visit</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Topics Discussed: {data.topicTitles}</p>

        <div className="report-content space-y-3">{processContentForDisplay(data.reportContent)}</div>

        <div className="report-footer mt-10 pt-6 border-t border-gray-300 dark:border-gray-600 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">If you have any questions regarding this summary,</p>
          <h3>
            {" "}
            <b>
              please contact {data.scribeName} at their email: {data.scribeEmail}.
            </b>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Thank you for choosing {data.clinicName || "our clinic"}. We appreciate your trust in our care.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto bg-gray-50 dark:bg-gray-900 rounded-xl shadow-2xl space-y-6 font-sans transition-colors duration-300">
      <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 text-center">Patient Visit Summary Generator</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Patient Name and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="patientName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Patient Name:
            </label>
            <input
              type="text"
              id="patientName"
              value={patientName}
              onChange={handlePatientNameChange}
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g., John Doe"
            />
          </div>
          <div>
            <label
              htmlFor="dateOfVisit"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date of Visit:
            </label>
            <input
              type="date"
              id="dateOfVisit"
              value={dateOfVisit}
              onChange={handleDateChange}
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
        </div>

        {/* Doctor and Scribe Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="doctor"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Doctor:
            </label>
            <select
              id="doctor"
              value={selectedDoctor}
              onChange={handleDoctorChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              {DOCTORS.map((doc) => (
                <option
                  key={doc.id}
                  value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="scribe"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Scribe (Optional):
            </label>
            <select
              id="scribe"
              value={selectedScribe}
              onChange={handleScribeChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="">--No Scribe--</option>
              {SCRIBES.map((scribe) => (
                <option
                  key={scribe.id}
                  value={scribe.id}>
                  {scribe.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic Selection (Checkboxes) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Topics Discussed:</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/30 max-h-60 overflow-y-auto">
            {Object.entries(TOPICS).map(([id, topic]) => (
              <label
                key={id}
                className="flex items-center space-x-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(id)}
                  onChange={(e) => handleTopicCheckboxChange(id, e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-500 rounded focus:ring-indigo-500 dark:bg-gray-600 dark:checked:bg-indigo-500"
                />
                <span>{topic.title}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Report Content Area */}
        <div>
          <label
            htmlFor="report-code"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Visit Summary Details (Auto-generated from selected topics, edit as needed):
          </label>
          <textarea
            id="report-code"
            value={code}
            onChange={handleCodeChange}
            rows={18}
            className="mt-1 block w-full p-3 text-sm border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
            placeholder="Select topics to auto-fill this area, or type your summary here..."
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            The content above will form the main body of the patient report. You can edit it directly. Use `**Bold Text**` for subheadings and `- List item` or `1. List item` for lists. Use `---` on a new line to create a separator between topic
            sections.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md">
            <p>{error}</p>
          </div>
        )}

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
            Generate Patient Summary
          </button>
        </div>
      </form>

      {generatedReportData && (
        <>
          <RenderPatientReport data={generatedReportData} />
          <div className="mt-6 text-center">
            <button
              onClick={handlePrintReport}
              className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800">
              Print Summary
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MedicalReportGenerator;
