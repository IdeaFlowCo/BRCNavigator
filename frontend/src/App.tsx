import "./App.css";
import { useState, useEffect } from "react"; // Import useEffect
import Papa, { ParseResult } from "papaparse";
import { DataProvider, useData } from "@/context/DataContext";
import QuerySection from "@/components/QuerySection";
import DataTable from "@/components/DataTable";
import HowItWorksModal from "@/components/HowItWorksModal"; // Import the modal component
import ResourcesSection from "@/components/ResourcesSection"; // Import the new component
import ErrorBoundary from "@/components/ErrorBoundary";
import { HelpCircle, Heart } from "lucide-react"; // Import the HelpCircle & Heart icons
import { VERSION_INFO } from "@/version"; // Import version info

// Define the main layout and logic component
function AppLayout() {
    // Log version info on mount for debugging
    useEffect(() => {
        console.log(`%c🔥 BRC Navigator Version Info`, 'color: #ff6600; font-size: 16px; font-weight: bold');
        console.log(`Build: ${VERSION_INFO.buildTime}`);
        console.log(`Mobile Fix: ${VERSION_INFO.mobileFix} - Breakpoint @ ${VERSION_INFO.breakpoint}px`);
        console.log(`Description: ${VERSION_INFO.description}`);
        console.log(`Last Commit: ${VERSION_INFO.lastCommit}`);
        console.log('Features:', VERSION_INFO.features);
        console.log('---');
        
        // Also log viewport info for debugging
        if (typeof window !== 'undefined') {
            console.log(`Current Viewport: ${window.innerWidth}x${window.innerHeight}`);
            console.log(`User Agent: ${navigator.userAgent.substring(0, 50)}...`);
        }
    }, []);
    
    const {
        headers,
        viewMode,
        lastNonFavoriteViewMode,
        setViewMode,
        setData,
        runSearchQuery,
        loading: isSearching,
    } = useData();
    const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
    const [query, setQuery] = useState<string>("");
    const [aboutMe, setAboutMe] = useState<string>(() => {
        // Initialize from localStorage
        return localStorage.getItem("brcNavigatorAboutMe") || "";
    }); // Add state for About Me
    const [sheetUrl, setSheetUrl] = useState<string>(
        "https://docs.google.com/spreadsheets/d/1Tzdfebm596C3TpsA9bPO0DLs8PcAQHD5/edit?usp=sharing&ouid=103820390436928978344&rtpof=true&sd=true"
    );
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isLoadingSpreadsheet, setIsLoadingSpreadsheet] =
        useState<boolean>(false);
    const [isHowItWorksModalOpen, setIsHowItWorksModalOpen] =
        useState<boolean>(false); // State for modal visibility

    // --- Helper function to fetch and parse data ---
    const parseData = (
        dataToParse: string[][] | string
    ): { headers: string[]; rows: string[][] } | null => {
        try {
            let parsedData: string[][] | null = null;
            if (typeof dataToParse === "string") {
                const results: ParseResult<string[]> = Papa.parse<string[]>(
                    dataToParse,
                    { skipEmptyLines: true }
                );
                parsedData = results.data;
            } else {
                parsedData = dataToParse;
            }

            if (!parsedData || parsedData.length < 1) {
                console.warn("Sheet appears to be empty or inaccessible.");
                return null;
            }
            const headers = parsedData[0];
            const rows = parsedData.slice(1);
            return { headers, rows };
        } catch (error) {
            console.error("Error parsing data:", error);
            alert(
                // Keep alert for user-facing errors
                `Failed to parse data. Error: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
            return null;
        }
    };

    // --- Function to fetch data from URL ---
    const fetchAndSetDataFromUrl = async (url: string, isPrecache = false) => {
        if (
            !url ||
            !url.startsWith("https://docs.google.com/spreadsheets/d/")
        ) {
            if (!isPrecache) {
                // Only alert on explicit user action
                alert("Please enter a valid Google Sheets URL.");
            } else {
                console.warn(
                    "Invalid default Google Sheet URL provided for precache."
                );
            }
            return null; // Indicate failure
        }
        setIsLoadingSpreadsheet(true);
        const csvUrl = url.replace(/\/edit.*$/, "/export?format=csv");
        let parsedResult: { headers: string[]; rows: string[][] } | null = null;
        try {
            const res = await fetch(csvUrl);
            if (!res.ok)
                throw new Error(`Failed to fetch sheet: ${res.statusText}`);
            const text = await res.text();
            parsedResult = parseData(text);
            if (parsedResult) {
                setData(parsedResult.headers, parsedResult.rows);
            } else {
                setData([], []); // Clear data if parsing failed
            }
        } catch (error) {
            console.error("Error fetching or parsing URL:", error);
            if (!isPrecache) {
                // Only alert on explicit user action
                alert(
                    `Failed to load data from URL. Check permissions or URL. Error: ${
                        error instanceof Error ? error.message : String(error)
                    }`
                );
            }
            setData([], []); // Clear data on fetch error
            parsedResult = null; // Ensure null is returned on error
        } finally {
            setIsLoadingSpreadsheet(false);
        }
        return parsedResult; // Return the result (or null if failed)
    };

    // --- Effect Hook for Pre-caching ---
    useEffect(() => {
        // Fetch data from the default URL when the component mounts
        fetchAndSetDataFromUrl(sheetUrl, true); // Pass true for isPrecache
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs only once on mount

    const handleTabChange = (value: "url" | "upload") => {
        setActiveTab(value);
    };

    const handleQueryChange = (value: string) => {
        setQuery(value);
    };

    const handleAboutMeChange = (value: string) => {
        // Add handler for About Me
        setAboutMe(value);
        // Save to localStorage
        localStorage.setItem("brcNavigatorAboutMe", value);
    };

    const handleSheetUrlChange = (value: string) => {
        setSheetUrl(value);
    };

    const handleFileChange = (newFile: File | null) => {
        setFile(newFile);
        setFileName(newFile ? newFile.name : null);
    };

    // Function to open the modal
    const openHowItWorksModal = () => {
        setIsHowItWorksModalOpen(true);
    };

    // Function to close the modal
    const closeHowItWorksModal = () => {
        setIsHowItWorksModalOpen(false);
    };

    const handleSubmit = async () => {
        // Clear previous results only when initiating a new search/load
        setData([], []);
        let parsedResult: { headers: string[]; rows: string[][] } | null = null;

        // Combine aboutMe and query for the final search
        const finalQuery = aboutMe
            ? `About me: ${aboutMe}. Looking for: ${query}`
            : query;

        if (activeTab === "url") {
            // Use the extracted function
            parsedResult = await fetchAndSetDataFromUrl(sheetUrl);
            // No need to set loading state here, fetchAndSetDataFromUrl handles it
        } else if (activeTab === "upload" && file) {
            setIsLoadingSpreadsheet(true); // Set loading for file processing
            const ext = file.name.split(".").pop()?.toLowerCase();
            try {
                if (ext === "csv") {
                    const text = await file.text();
                    parsedResult = parseData(text);
                } else if (ext === "xls" || ext === "xlsx") {
                    // Dynamically import ExcelJS only when needed
                    const ExcelJS = await import("exceljs");
                    const fileData = await file.arrayBuffer();
                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.load(fileData);
                    const worksheet = workbook.worksheets[0];
                    
                    // Convert worksheet to 2D array (similar to xlsx's sheet_to_json with header: 1)
                    const json: string[][] = [];
                    worksheet.eachRow((row) => {
                        const rowData: string[] = [];
                        row.eachCell((cell, colNumber) => {
                            rowData[colNumber - 1] = cell.value?.toString() || "";
                        });
                        json.push(rowData);
                    });
                    
                    parsedResult = parseData(json);
                } else {
                    alert("Unsupported file type.");
                }
            } catch (error) {
                console.error("Error reading or parsing file:", error);
                alert(
                    `Failed to process file. Error: ${
                        error instanceof Error ? error.message : String(error)
                    }`
                );
            }
            setIsLoadingSpreadsheet(false); // Unset loading after file processing
        }

        // Run search query only if data was successfully loaded/parsed
        if (parsedResult) {
            // setData is now called within fetchAndSetDataFromUrl or after file parsing
            if (finalQuery.trim()) {
                try {
                    // Pass the freshly parsed data directly to the updated function
                    await runSearchQuery(finalQuery, parsedResult);
                } catch (searchError) {
                    console.error("Search operation failed:", searchError);
                    alert("An error occurred during the search."); // Inform the user
                }
            } else {
                // No need to call runSearchQuery if there's no query
            }
        }
        // No else needed, setData handled within fetch/parse logic
    };

    return (
        // Apply class name for App Layout
        <div className="app-layout">
            {/* Apply class name for Header */}
            <header className="app-header">
                {/* Apply class name for Header Content */}
                <div className="header-content">
                    {/* Apply class name for Logo/Title */}
                    <div className="logo-title">
                        <svg // Simple Burning Man stick figure
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Head */}
                            <circle cx="12" cy="5" r="2" />
                            {/* Body */}
                            <line x1="12" y1="7" x2="12" y2="15" />
                            {/* Arms */}
                            <line x1="8" y1="9" x2="16" y2="9" />
                            {/* Legs */}
                            <line x1="12" y1="15" x2="9" y2="19" />
                            <line x1="12" y1="15" x2="15" y2="19" />
                        </svg>
                        BRC Navigator
                    </div>
                    {/* Apply class name for Nav */}
                    <nav className="app-nav">
                        {/* Change link to button triggering the modal */}
                        <button
                            onClick={openHowItWorksModal}
                            className="nav-link"
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                            }}
                        >
                            <HelpCircle strokeWidth={2.5} />
                            How it works
                        </button>
                        {/* Apply class name for Nav Link */}
                        <a
                            href="https://github.com/IdeaFlowCo/BRCNavigator"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nav-link"
                        >
                            <svg // Placeholder SVG - Add relevant path
                                fill="currentColor"
                                viewBox="0 0 16 16"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                            </svg>
                            GitHub
                        </a>
                    </nav>
                </div>
            </header>

            {/* Apply class name for Main Content */}
            <main className="main-content">
                {/* Apply class name for Intro Section */}
                <div className="intro-section">
                    <h1>Burning Man 2025: Tomorrow Today</h1>
                    <p>
                        Discover art installations, workshops, performances, and
                        gatherings across the playa that match your interests
                        and expand your consciousness.
                    </p>
                </div>

                <ErrorBoundary>
                    <QuerySection
                        query={query}
                        sheetUrl={sheetUrl}
                        file={file}
                        fileName={fileName}
                        isLoading={isSearching}
                        isLoadingSpreadsheet={isLoadingSpreadsheet}
                        activeTab={activeTab}
                        aboutMe={aboutMe}
                        onQueryChange={handleQueryChange}
                        onSheetUrlChange={handleSheetUrlChange}
                        onFileChange={handleFileChange}
                        onTabChange={handleTabChange}
                        onAboutMeChange={handleAboutMeChange}
                        onSubmit={handleSubmit}
                    />
                </ErrorBoundary>

                {/* Conditional Rendering for Table Area with Button Repositioned */}
                {headers.length > 0 && (
                    <div
                        className="table-area-wrapper"
                        style={{ position: "relative" }}
                    >
                        {" "}
                        {/* New wrapper */}
                        {/* Heading */}
                        <h2 className="text-lg font-semibold mb-2">
                            {" "}
                            {/* Moved h2 inside, kept margin */}
                            {viewMode === "favorites"
                                ? "My Favorites"
                                : viewMode === "search"
                                ? "Search Results"
                                : "All Events"}
                        </h2>
                        {/* DataTable */}
                        <ErrorBoundary>
                            <DataTable /> {/* Moved DataTable inside */}
                        </ErrorBoundary>
                        {/* Favorites Button (Standard HTML with custom CSS class) */}
                        <button
                            type="button"
                            className="favorites-toggle-button" // New custom class
                            onClick={() => {
                                const nextView =
                                    viewMode === "favorites"
                                        ? lastNonFavoriteViewMode
                                        : "favorites";
                                setViewMode(nextView);
                            }}
                            data-favorited={viewMode === "favorites"} // Data attribute for CSS styling
                            // style prop removed - positioning handled in App.css
                        >
                            <Heart
                            // className removed - styling handled in App.css
                            // Size controlled via CSS potentially
                            />
                            <span>
                                {" "}
                                {/* Wrap text in span for potential styling */}
                                {viewMode === "favorites"
                                    ? "Show All"
                                    : "My Favorites"}
                            </span>
                        </button>
                    </div>
                )}

                <ResourcesSection />
            </main>

            {/* Apply class name for Footer */}
            <footer className="app-footer">
                {/* Apply class name for Footer Content */}
                <div className="footer-content">
                    <p>
                        BRC Navigator is an open-source project.{" "}
                        {/* Apply class name for Footer Link */}
                        <a
                            href="https://github.com/IdeaFlowCo/BRCNavigator"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-link"
                        >
                            <svg // Placeholder SVG - Add relevant path
                                fill="currentColor"
                                viewBox="0 0 16 16"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                            </svg>
                            View on GitHub
                        </a>
                    </p>
                    <p>MIT License</p>
                </div>
            </footer>

            {/* Conditionally render the modal */}
            <HowItWorksModal
                isOpen={isHowItWorksModalOpen}
                onClose={closeHowItWorksModal}
            />
        </div>
    );
}

// App component now just sets up the provider
function App() {
    return (
        <DataProvider>
            <AppLayout />
        </DataProvider>
    );
}

export default App;
