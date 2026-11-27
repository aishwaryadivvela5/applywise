
/* ==========================================
   APPLYWISE - APPLICATION TRACKER
   Complete working JavaScript
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    // 1. CONNECT HTML ELEMENTS
    const form = document.getElementById("applicationForm");
    const list = document.getElementById("applicationList");

    const companyInput = document.getElementById("companyName");
    const roleInput = document.getElementById("jobRole");
    const dateInput = document.getElementById("applicationDate");
    const statusInput = document.getElementById("applicationStatus");

    const searchInput = document.getElementById("searchInput");
    const filterStatus = document.getElementById("filterStatus");

    const addButton = document.getElementById("addApplicationBtn");
    const cancelButton = document.getElementById("cancelEditBtn");
    const formTitle = document.getElementById("formTitle");

    // 2. CHECK HTML CONNECTIONS
    if (!form || !list) {
        console.error("ApplyWise: Form or application list not found.");
        alert("Error: Application form is missing from HTML.");
        return;
    }

    // 3. LOAD SAVED APPLICATIONS
    let applications = [];

    try {
        applications = JSON.parse(
            localStorage.getItem("applications") || "[]"
        );
    } catch (error) {
        console.error("Error loading saved applications:", error);
        applications = [];
    }

    // Normalize older data formats
    applications = applications.map(app => ({
        companyName: app.companyName || app.company || "",
        jobRole: app.jobRole || app.role || "",
        applicationDate: app.applicationDate || app.date || "",
        applicationStatus:
            app.applicationStatus || app.status || "Applied"
    }));

    let editingIndex = null;


    // 4. SAVE APPLICATIONS
    function saveApplications() {
        localStorage.setItem(
            "applications",
            JSON.stringify(applications)
        );
    }


    // 5. UPDATE DASHBOARD COUNTS
    function updateDashboard() {

        const total = applications.length;

        const applied = applications.filter(app =>
            app.applicationStatus === "Applied"
        ).length;

        const interviews = applications.filter(app =>
            app.applicationStatus === "Interview"
        ).length;

        const selected = applications.filter(app =>
            app.applicationStatus === "Selected"
        ).length;

        const rejected = applications.filter(app =>
            app.applicationStatus === "Rejected"
        ).length;

        // Update HTML counters safely
        const totalElement = document.getElementById("totalCount");
        const appliedElement = document.getElementById("appliedCount");
        const interviewElement = document.getElementById("interviewCount");
        const selectedElement = document.getElementById("selectedCount");
        const rejectedElement = document.getElementById("rejectedCount");

        if (totalElement) totalElement.textContent = total;
        if (appliedElement) appliedElement.textContent = applied;
        if (interviewElement) interviewElement.textContent = interviews;
        if (selectedElement) selectedElement.textContent = selected;
        if (rejectedElement) rejectedElement.textContent = rejected;

        console.log("ApplyWise dashboard:", {
            total,
            applied,
            interviews,
            selected,
            rejected
        });
    }


    // 6. CREATE APPLICATION CARD
    function createCard(app, index) {

        const card = document.createElement("div");
        card.className = "application-card";

        const company = document.createElement("h3");
        company.textContent = app.companyName;

        const role = document.createElement("p");
        role.textContent = "Job Role: " + app.jobRole;

        const date = document.createElement("p");
        date.textContent = "Application Date: " + app.applicationDate;

        const badge = document.createElement("span");
        badge.className =
            "status-badge " + app.applicationStatus.toLowerCase();

        badge.textContent = app.applicationStatus;

        const actions = document.createElement("div");
        actions.className = "application-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "edit-button";

        editButton.addEventListener("click", function () {
            editApplication(index);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", function () {
            deleteApplication(index);
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        card.appendChild(company);
        card.appendChild(role);
        card.appendChild(date);
        card.appendChild(badge);
        card.appendChild(actions);

        return card;
    }


    // 7. DISPLAY APPLICATIONS
    function displayApplications() {

        list.innerHTML = "";

        const searchText = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const filterValue = filterStatus
            ? filterStatus.value
            : "All";

        const filtered = applications
            .map((app, index) => ({
                ...app,
                originalIndex: index
            }))
            .filter(app => {

                const company = app.companyName.toLowerCase();
                const role = app.jobRole.toLowerCase();

                const searchMatch =
                    company.includes(searchText) ||
                    role.includes(searchText);

                const statusMatch =
                    filterValue === "All" ||
                    app.applicationStatus === filterValue;

                return searchMatch && statusMatch;
            });

        if (filtered.length === 0) {

            const emptyMessage = document.createElement("p");
            emptyMessage.className = "empty-message";
            emptyMessage.textContent =
                "No applications found. Add your first job application!";

            list.appendChild(emptyMessage);

        } else {

            filtered.forEach(app => {

                const card = createCard(
                    app,
                    app.originalIndex
                );

                list.appendChild(card);
            });
        }

        // ALWAYS update counts
        updateDashboard();
    }


    // 8. ADD OR UPDATE APPLICATION
    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const newApplication = {
            companyName: companyInput.value.trim(),
            jobRole: roleInput.value.trim(),
            applicationDate: dateInput.value,
            applicationStatus: statusInput.value
        };

        if (
            !newApplication.companyName ||
            !newApplication.jobRole ||
            !newApplication.applicationDate
        ) {
            alert("Please fill in all required fields.");
            return;
        }

        if (editingIndex !== null) {

            applications[editingIndex] = newApplication;

            alert("Application updated!");

        } else {

            applications.push(newApplication);

            alert("Application added successfully!");
        }

        saveApplications();

        resetForm();

        displayApplications();
    });


    // 9. EDIT APPLICATION
    function editApplication(index) {

        const app = applications[index];

        companyInput.value = app.companyName;
        roleInput.value = app.jobRole;
        dateInput.value = app.applicationDate;
        statusInput.value = app.applicationStatus;

        editingIndex = index;

        if (formTitle) {
            formTitle.textContent = "Edit Application";
        }

        if (addButton) {
            addButton.textContent = "Update Application";
        }

        if (cancelButton) {
            cancelButton.hidden = false;
        }

        form.scrollIntoView({
            behavior: "smooth"
        });
    }


    // 10. DELETE APPLICATION
    function deleteApplication(index) {

        if (!confirm("Do you want to delete this application?")) {
            return;
        }

        applications.splice(index, 1);

        saveApplications();

        resetForm();

        displayApplications();
    }


    // 11. RESET FORM
    function resetForm() {

        form.reset();

        editingIndex = null;

        if (formTitle) {
            formTitle.textContent = "Add New Application";
        }

        if (addButton) {
            addButton.textContent = "Add Application";
        }

        if (cancelButton) {
            cancelButton.hidden = true;
        }
    }


    // 12. CANCEL EDIT
    if (cancelButton) {
        cancelButton.addEventListener("click", resetForm);
    }


    // 13. SEARCH
    if (searchInput) {
        searchInput.addEventListener("input", displayApplications);
    }


    // 14. FILTER
    if (filterStatus) {
        filterStatus.addEventListener("change", displayApplications);
    }


    // 15. START APPLICATION
    saveApplications();
    displayApplications();

    console.log("ApplyWise JavaScript loaded successfully.");

});
