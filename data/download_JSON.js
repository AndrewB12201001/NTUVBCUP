function downloadJSONFromUserInput(fileName, jsonString) {
    // Get the filename from the user


    if (!fileName) {
        alert("Filename cannot be empty.");
        return;
    }
    
    try {
        // Validate the JSON format
        const jsonObject = JSON.parse(jsonString);

        // Convert JSON object back to a formatted string
        const formattedJSON = JSON.stringify(jsonObject, null, 2);

        // Create a Blob with JSON content
        const blob = new Blob([formattedJSON], { type: "application/json" });

        // Create a temporary download link
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;

        // Trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        console.log("JSON file successfully downloaded!");
    } catch (error) {
        console.error("Invalid JSON string:", error);
        alert("Invalid JSON format. Please check and try again.");
    }
}