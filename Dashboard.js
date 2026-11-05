
document.addEventListener("DOMContentLoaded", () => {


    const currentUser = JSON.parse(
        localStorage.getItem("montraCurrentUser") || "null"
    );

    if (!currentUser || !currentUser.id || !currentUser.email) {
        window.location.href = "login.html";
        return;
    }

  

    // Handle profile picture upload and saving
 
const sidebarUserName =
    document.getElementById("sidebarUserName");

const sidebarProfilePicture =
    document.getElementById("sidebarProfilePicture");

const profilePicturePreview =
    document.getElementById("profilePicturePreview");

const profilePictureForm =
    document.getElementById("profilePictureForm");

const profilePictureInput =
    document.getElementById("profilePictureInput");

const profilePictureStatus =
    document.getElementById("profilePictureStatus");

const defaultPicture = "profile.jfif";

// Display the user's name.
if (sidebarUserName) {
    sidebarUserName.textContent =
        currentUser.fullName || "User";
}

// Display the profile picture.
function displayProfilePicture(picture) {
    const image = picture || defaultPicture;

    if (sidebarProfilePicture) {
        sidebarProfilePicture.src = image;
    }

    if (profilePicturePreview) {
        profilePicturePreview.src = image;
    }
}

// Load the saved profile picture.
displayProfilePicture(currentUser.profilePicture);

// Save a new profile picture.
if (profilePictureForm) {
    profilePictureForm.addEventListener("submit", event => {
        event.preventDefault();

        const file = profilePictureInput.files[0];

        if (!file) {
            profilePictureStatus.textContent =
                "Please choose an image.";
            return;
        }

        if (!file.type.startsWith("image/")) {
            profilePictureStatus.textContent =
                "Please select a valid image.";
            return;
        }

        if (file.size > 1024 * 1024) {
            profilePictureStatus.textContent =
                "Please choose an image smaller than 1 MB.";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const picture = reader.result;

            try {
                const users = JSON.parse(
                    localStorage.getItem("montraUsers") || "[]"
                );

                if (!Array.isArray(users)) {
                    throw new Error("Invalid users data.");
                }

                const userIndex = users.findIndex(user =>
                    user && (
                        String(user.id) === String(currentUser.id) ||
                        String(user.email).toLowerCase() ===
                        currentUser.email.toLowerCase()
                    )
                );

                if (userIndex === -1) {
                    profilePictureStatus.textContent =
                        "Could not find your account.";
                    return;
                }

                // Update the account in montraUsers.
                users[userIndex].profilePicture = picture;

                localStorage.setItem(
                    "montraUsers",
                    JSON.stringify(users)
                );

                // Update the current login session.
                currentUser.profilePicture = picture;

                localStorage.setItem(
                    "montraCurrentUser",
                    JSON.stringify(currentUser)
                );

                // Refresh both displayed pictures.
                displayProfilePicture(picture);

                profilePictureStatus.textContent =
                    "Profile picture updated successfully!";

                profilePictureInput.value = "";

            } catch (error) {
                profilePictureStatus.textContent =
                    "Unable to save the picture. Try a smaller image.";
            }
        };

        reader.onerror = () => {
            profilePictureStatus.textContent =
                "Could not read the selected image.";
        };

        reader.readAsDataURL(file);
    });
}


    const logoutBtn = document.getElementById("logoutBtn") 

    if (logoutBtn) {
        logoutBtn.addEventListener("click", (event) => {
            event.preventDefault();

            const confirmLogout = confirm(
                "Are you sure you want to log out?"
            );

            if (!confirmLogout) {
                return;
            }

            localStorage.removeItem("montraCurrentUser");

            window.location.href = "login.html";
        })
    }

    // Logout when the user clicks the Montra logo.
    const brandLogo = document.getElementById("brandLogo");

    if (brandLogo) {
        brandLogo.addEventListener("click", event => {
            event.preventDefault();

            const confirmLogout = confirm(
                "Are you sure you want to leave Montra and log out?"
            );

            if (!confirmLogout) {
                return;
            }

            // Remove the current login session.
            localStorage.removeItem("montraCurrentUser");

            // Redirect to the homepage.
            window.location.href = "index.html";
        });
    }

    alert(`Welcome back, ${currentUser.fullName || "User"}!`);

    const userId = String(currentUser.id);
    const userEmail = currentUser.email.toLowerCase();

    const currencyFormatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    });

    const percentageFormatter = new Intl.NumberFormat("en-US", {
        style: "percent",
        maximumFractionDigits: 1
    });


    let allTransactions = [];

    try {
        const savedTransactions = JSON.parse(
            localStorage.getItem("montraTransactions") || "[]"
        );

        if (Array.isArray(savedTransactions)) {
            allTransactions = savedTransactions.filter(
                transaction =>
                    transaction &&
                    (transaction.type === "income" ||
                     transaction.type === "expense") &&
                    Number.isFinite(Number(transaction.amount)) &&
                    Number(transaction.amount) > 0 &&
                    typeof transaction.category === "string" &&
                    typeof transaction.description === "string" &&
                    typeof transaction.date === "string"
            );
        }
    } catch {
        allTransactions = [];
    }

    // Show only the logged-in user's transactions.
    let transactions = allTransactions.filter(transaction =>
        String(transaction.userId) === userId
    );

    const transactionForm =
        document.getElementById("transactionForm");

    const transactionStatus =
        document.getElementById("transactionStatus");

    const userInfoForm =
        document.getElementById("userInfoForm");

    const userInfoStatus =
        document.getElementById("userInfoStatus");

    const today = new Date();
    today.setMinutes(
        today.getMinutes() - today.getTimezoneOffset()
    );

    if (transactionForm) {
        transactionForm.elements.date.value =
            today.toISOString().slice(0, 10);
    }


    function saveTransactions() {
        const otherUsersTransactions = allTransactions.filter(
            transaction =>
                String(transaction.userId) !== userId
        );

        localStorage.setItem(
            "montraTransactions",
            JSON.stringify([
                ...otherUsersTransactions,
                ...transactions
            ])
        );
    }


    function renderTransactionList(list, items, emptyMessage) {
        if (!list) return;

        list.replaceChildren();

        if (items.length === 0) {
            const emptyItem = document.createElement("li");
            emptyItem.className = "empty-state";
            emptyItem.textContent = emptyMessage;
            list.append(emptyItem);
            return;
        }

        items.forEach(transaction => {
            const item = document.createElement("li");
            const details = document.createElement("div");
            const title = document.createElement("strong");
            const metadata = document.createElement("span");
            const amount = document.createElement("strong");

            const signedAmount =
                Number(transaction.amount) *
                (transaction.type === "income" ? 1 : -1);

            details.className = "transaction-details";

            title.className = "transaction-title";
            title.textContent = transaction.description;

            metadata.className = "transaction-meta";
            metadata.textContent =
                `${transaction.category} · ` +
                new Date(
                    `${transaction.date}T00:00:00`
                ).toLocaleDateString();

            amount.className =
                `transaction-amount ${transaction.type}`;

            amount.textContent =
                `${signedAmount > 0 ? "+" : "−"}` +
                currencyFormatter.format(Math.abs(signedAmount));

            details.append(title, metadata);
            item.append(details, amount);
            list.append(item);
        });
    }


    function renderDashboard() {
        const totals = transactions.reduce(
            (result, transaction) => {
                result[transaction.type] +=
                    Number(transaction.amount);

                return result;
            },
            { income: 0, expense: 0 }
        );

        const balanceTotal =
            document.getElementById("balanceTotal");

        const incomeTotal =
            document.getElementById("incomeTotal");

        const expenseTotal =
            document.getElementById("expenseTotal");

        if (balanceTotal) {
            balanceTotal.textContent =
                currencyFormatter.format(
                    totals.income - totals.expense
                );
        }

        if (incomeTotal) {
            incomeTotal.textContent =
                currencyFormatter.format(totals.income);
        }

        if (expenseTotal) {
            expenseTotal.textContent =
                currencyFormatter.format(totals.expense);
        }

        const newestFirst = [...transactions].sort(
            (first, second) =>
                Number(second.createdAt || 0) -
                Number(first.createdAt || 0)
        );

        renderTransactionList(
            document.getElementById("recentTransactions"),
            newestFirst.slice(0, 5),
            "No transactions yet. Add your first income or expense above."
        );

        renderTransactionList(
            document.getElementById("transactionHistory"),
            newestFirst,
            "Your saved transactions will appear here."
        );

        const historyCount =
            document.getElementById("historyCount");

        if (historyCount) {
            historyCount.textContent =
                `${transactions.length} ` +
                `${transactions.length === 1
                    ? "transaction"
                    : "transactions"}`;
        }

        const categoryTotals = new Map();

        transactions.forEach(transaction => {
            const key =
                `${transaction.type}:` +
                transaction.category.toLowerCase();

            const categoryTotal = categoryTotals.get(key) || {
                category: transaction.category,
                type: transaction.type,
                amount: 0
            };

            categoryTotal.amount += Number(transaction.amount);
            categoryTotals.set(key, categoryTotal);
        });

        const analyticsTotals =
            document.getElementById("analyticsTotals");

        if (analyticsTotals) {
            analyticsTotals.textContent =
                `Total spent: ${currencyFormatter.format(totals.expense)} · ` +
                `Total income: ${currencyFormatter.format(totals.income)}`;
        }

        const categoryRows = [...categoryTotals.values()].sort(
            (first, second) =>
                first.type === second.type
                    ? second.amount - first.amount
                    : first.type === "expense" ? -1 : 1
        );

        const categoryList =
            document.getElementById("categorySummary");

        if (!categoryList) return;

        categoryList.replaceChildren();

        if (categoryRows.length === 0) {
            const emptyItem = document.createElement("li");
            emptyItem.className = "empty-state";
            emptyItem.textContent =
                "Income and expense categories will appear after you add a transaction.";

            categoryList.append(emptyItem);
            return;
        }

        categoryRows.forEach(category => {
            const item = document.createElement("li");
            const details = document.createElement("div");
            const heading = document.createElement("div");
            const label = document.createElement("strong");
            const amount = document.createElement("strong");
            const percentage = document.createElement("span");
            const progress = document.createElement("div");
            const progressFill = document.createElement("span");

            const share = totals[category.type] > 0
                ? category.amount / totals[category.type]
                : 0;

            item.className = "category-summary-item";
            details.className = "category-summary-details";
            heading.className = "category-summary-heading";

            label.textContent =
                `${category.category} (${category.type})`;

            amount.className =
                `transaction-amount ${category.type}`;

            amount.textContent =
                `${category.type === "income" ? "+" : "−"}` +
                currencyFormatter.format(category.amount);

            percentage.className = "category-summary-percentage";
            percentage.textContent =
                `${percentageFormatter.format(share)} of ` +
                `${category.type === "expense" ? "expenses" : "income"}`;

            progress.className =
                `category-summary-progress ${category.type}`;

            progress.setAttribute("role", "progressbar");
            progress.setAttribute(
                "aria-label",
                `${category.category} share of total ${category.type}`
            );
            progress.setAttribute("aria-valuemin", "0");
            progress.setAttribute("aria-valuemax", "100");
            progress.setAttribute(
                "aria-valuenow",
                String((share * 100).toFixed(1))
            );

            progressFill.style.width = `${share * 100}%`;

            heading.append(label, amount, percentage);
            progress.append(progressFill);
            details.append(heading, progress);
            item.append(details);
            categoryList.append(item);
        });
    }


    if (transactionForm) {
        transactionForm.addEventListener("submit", event => {
            event.preventDefault();

            const formData = new FormData(transactionForm);

            const type = String(formData.get("type"));
            const amount = Number(formData.get("amount"));
            const category =
                String(formData.get("category") || "").trim();

            const description =
                String(formData.get("description") || "").trim();

            const date = String(formData.get("date") || "");

            if (
                !["income", "expense"].includes(type) ||
                !Number.isFinite(amount) ||
                amount <= 0 ||
                !category ||
                !description ||
                !date
            ) {
                if (transactionStatus) {
                    transactionStatus.textContent =
                        "Please enter valid transaction details.";
                }
                return;
            }

            const newTransaction = {
                id: crypto.randomUUID(),
                userId,
                userEmail,
                type,
                amount,
                category,
                description,
                date,
                createdAt: Date.now()
            };

            transactions.push(newTransaction);
            allTransactions.push(newTransaction);

            try {
                saveTransactions();
            } catch {
                transactions.pop();
                allTransactions.pop();

                if (transactionStatus) {
                    transactionStatus.textContent =
                        "Unable to save the transaction in this browser.";
                }
                return;
            }

            renderDashboard();

            if (transactionStatus) {
                transactionStatus.textContent =
                    "Transaction saved and totals updated.";
            }

            transactionForm.reset();
            transactionForm.elements.date.value =
                today.toISOString().slice(0, 10);
        });
    }


    const links = document.querySelectorAll("[data-view]");
    const views = document.querySelectorAll(".view-panel");

    links.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();

            const view = document.getElementById(
                `${link.dataset.view}View`
            );

            if (!view) return;

            views.forEach(panel => {
                panel.hidden = panel !== view;
            });

            links.forEach(item => {
                item.classList.toggle("active", item === link);
            });

            const pageTitle = document.getElementById("pageTitle");
            const subtitle =
                document.getElementById("dashboardSubtitle");

            if (pageTitle) {
                pageTitle.textContent = view.dataset.title || "";
            }

            if (subtitle) {
                subtitle.textContent = view.dataset.subtitle || "";
            }
        });
    });
    
   // Hamburger menu functionality
const burgerMenu = document.getElementById("burgerMenu");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

if (burgerMenu && sidebar && sidebarOverlay) {

    function closeSidebar() {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("active");

        burgerMenu.textContent = "☰";
        burgerMenu.setAttribute("aria-expanded", "false");
        burgerMenu.setAttribute(
            "aria-label",
            "Open navigation menu"
        );
    }

    burgerMenu.addEventListener("click", () => {
        const isOpen = sidebar.classList.toggle("open");

        sidebarOverlay.classList.toggle("active", isOpen);

        burgerMenu.textContent = isOpen ? "✕" : "☰";
        burgerMenu.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        burgerMenu.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    });

    sidebarOverlay.addEventListener("click", closeSidebar);

    links.forEach(link => {
        link.addEventListener("click", closeSidebar);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });
}

function loadUserInfo() {
    if (!userInfoForm) return;

    try {
        const users = JSON.parse(
            localStorage.getItem("montraUsers") || "[]"
        );

        if (!Array.isArray(users)) return;

        const savedUser = users.find(user =>
            user &&
            String(user.id) === userId
        );

        if (!savedUser) return;

        userInfoForm.elements.namedItem("name").value =
            savedUser.fullName || "";

        userInfoForm.elements.namedItem("email").value =
            savedUser.email || "";

        userInfoForm.elements.namedItem("phone").value =
            savedUser.phone || "";

        userInfoForm.elements.namedItem("address").value =
            savedUser.address || "";

    } catch {
        if (userInfoStatus) {
            userInfoStatus.textContent =
                "Unable to load your saved profile.";
        }
    }
}


    if (userInfoForm) {
        userInfoForm.addEventListener("submit", event => {
            event.preventDefault();

            try {
                const users = JSON.parse(
                    localStorage.getItem("montraUsers") || "[]"
                );

                if (!Array.isArray(users)) {
                    throw new Error("Invalid saved accounts.");
                }

                const index = users.findIndex(user =>
                    user &&
                    (String(user.id) === userId ||
                     String(user.email).toLowerCase() === userEmail)
                );

                if (index === -1) {
                    throw new Error("Account not found.");
                }

                const formValues = Object.fromEntries(
                    new FormData(userInfoForm).entries()
                );

                // Only update fields that exist on the account.
                const updatedUser = {
                    ...users[index]
                };

                updatedUser.fullName = String(formValues.name).trim();
                updatedUser.phone = String(formValues.phone || "").trim();
                updatedUser.address = String(formValues.address || "").trim();

                // Do not allow the profile form to change account identity.
                updatedUser.id = users[index].id;

                const newEmail =
                    String(updatedUser.email || "").toLowerCase();

                if (!newEmail || newEmail !== userEmail) {
                    if (userInfoStatus) {
                        userInfoStatus.textContent =
                            "Email changes require updating your login session too.";
                    }
                    return;
                }

                users[index] = updatedUser;

                localStorage.setItem(
                    "montraUsers",
                    JSON.stringify(users)
                );

                currentUser.fullName = updatedUser.fullName;
                currentUser.email = updatedUser.email;

                if (sidebarUserName) {
                    sidebarUserName.textContent =
                        currentUser.fullName || "User";
                }

                localStorage.setItem(
                    "montraCurrentUser",
                    JSON.stringify(currentUser)
                );

                if (userInfoStatus) {
                    userInfoStatus.textContent =
                        "Your information has been saved.";
                }
            } catch {
                if (userInfoStatus) {
                    userInfoStatus.textContent =
                        "Unable to save your profile.";
                }
            }
        });
    }


    const thisMonthBtn =
        document.getElementById("thisMonthBtn");

    if (thisMonthBtn) {
        thisMonthBtn.addEventListener("click", () => {
            const subtitle =
                document.getElementById("dashboardSubtitle");

            if (subtitle) {
                subtitle.textContent =
                    "Track your monthly activities";
            }

        });
    }


    loadUserInfo();
    renderDashboard();
});
