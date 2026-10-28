document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ==========================================
    // 1. HELPER FUNCTIONS
    // ==========================================

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    function getElement(id) {
        return document.getElementById(id);
    }

    function showMessage(element, message, type = "") {
        if (!element) return;

        element.textContent = message;
        element.className = type ? `action-result ${type}` : "action-result";
        element.hidden = false;
    }

    // ==========================================
    // 2. CINEMATIC INTRO ANIMATION
    // ==========================================

    const intro = getElement("intro");
    const website = getElement("website");
    const enterButton = getElement("enterButton");
    const skipIntro = getElement("skipIntro");

    let introFinished = false;

    function enterWebsite() {
        if (introFinished) return;

        introFinished = true;

        if (intro) {
            intro.classList.add("doors-open");

            window.setTimeout(() => {
                intro.classList.add("finished");
            }, 500);
        }

        if (website) {
            website.classList.add("visible");
        }

        try {
            sessionStorage.setItem("foodflowIntroSeen", "yes");
        } catch (error) {
            // Website can still work if session storage is unavailable.
        }
    }

    let introAlreadySeen = false;

    try {
        introAlreadySeen =
            sessionStorage.getItem("foodflowIntroSeen") === "yes";
    } catch (error) {
        introAlreadySeen = false;
    }

    const reducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!intro || !website) {
        if (website) {
            website.classList.add("visible");
        }
    } else if (introAlreadySeen || reducedMotion) {
        intro.classList.add("finished");
        website.classList.add("visible");
        introFinished = true;
    } else {
        window.setTimeout(() => {
            if (!introFinished && intro) {
                intro.classList.add("doors-open");
            }
        }, 350);

        window.setTimeout(() => {
            enterWebsite();
        }, 8500);
    }

    if (enterButton) {
        enterButton.addEventListener("click", enterWebsite);
    }

    if (skipIntro) {
        skipIntro.addEventListener("click", enterWebsite);
    }

    // ==========================================
    // 3. FOOD MENU DATABASE
    // ==========================================

    const meals = [
        {
            name: "Masala Dosa",
            emoji: "🥞",
            price: 80,
            category: "veg",
            description: "Crispy dosa with delicious potato filling.",
            tags: ["Budget Friendly", "Comfort Food"],
            moods: ["happy", "tired", "hungry"],
            type: "light"
        },
        {
            name: "Veg Sandwich",
            emoji: "🥪",
            price: 60,
            category: "veg",
            description: "Fresh, light and perfect for a quick bite.",
            tags: ["Quick Bite", "Budget Friendly"],
            moods: ["happy", "tired", "stressed"],
            type: "light"
        },
        {
            name: "Paneer Roll",
            emoji: "🌯",
            price: 100,
            category: "veg",
            description: "Soft wrap filled with spicy paneer.",
            tags: ["Popular", "Protein"],
            moods: ["happy", "hungry", "stressed"],
            type: "protein"
        },
        {
            name: "Veg Fried Rice",
            emoji: "🍚",
            price: 110,
            category: "veg",
            description: "Flavorful rice tossed with fresh vegetables.",
            tags: ["Comfort Food", "Filling"],
            moods: ["happy", "sad", "hungry"],
            type: "spicy"
        },
        {
            name: "Dal Rice",
            emoji: "🍛",
            price: 90,
            category: "veg",
            description: "A simple, comforting and satisfying meal.",
            tags: ["Comfort Food", "Value Meal"],
            moods: ["sad", "tired", "stressed"],
            type: "light"
        },
        {
            name: "Paneer Thali",
            emoji: "🍱",
            price: 150,
            category: "veg",
            description: "A hearty Indian meal with paneer and sides.",
            tags: ["Full Meal", "Protein"],
            moods: ["hungry", "happy"],
            type: "protein"
        },
        {
            name: "Chicken Sandwich",
            emoji: "🥙",
            price: 120,
            category: "nonveg",
            description: "A tasty chicken sandwich for a filling snack.",
            tags: ["Quick Bite", "Protein"],
            moods: ["happy", "hungry", "tired"],
            type: "protein"
        },
        {
            name: "Egg Fried Rice",
            emoji: "🍳",
            price: 100,
            category: "nonveg",
            description: "Egg and rice cooked with aromatic spices.",
            tags: ["Value Meal", "Filling"],
            moods: ["happy", "hungry", "stressed"],
            type: "spicy"
        },
        {
            name: "Chicken Biryani",
            emoji: "🍗",
            price: 180,
            category: "nonveg",
            description: "Fragrant rice layered with flavorful chicken.",
            tags: ["Popular", "Full Meal"],
            moods: ["happy", "hungry"],
            type: "spicy"
        },
        {
            name: "Boiled Egg Toast",
            emoji: "🍞",
            price: 70,
            category: "nonveg",
            description: "A simple egg-based snack for a quick meal.",
            tags: ["Quick Bite", "Protein"],
            moods: ["tired", "stressed", "hungry"],
            type: "light"
        },
        {
            name: "Fruit Bowl",
            emoji: "🍓",
            price: 75,
            category: "veg",
            description: "A refreshing bowl of seasonal fruits.",
            tags: ["Light", "Fresh"],
            moods: ["sad", "tired", "stressed"],
            type: "light"
        },
        {
            name: "Chole Rice",
            emoji: "🥘",
            price: 100,
            category: "veg",
            description: "Spiced chickpeas served with steamed rice.",
            tags: ["Filling", "Value Meal"],
            moods: ["hungry", "sad", "happy"],
            type: "protein"
        }
    ];

    // ==========================================
    // 4. CUSTOMER PREFERENCES
    // ==========================================

    const mealForm = getElement("mealForm");
    const customerName = getElement("customerName");
    const customerBudget = getElement("customerBudget");
    const customerMood = getElement("customerMood");
    const foodPreference = getElement("foodPreference");
    const dietaryNeed = getElement("dietaryNeed");
    const rememberMe = getElement("rememberMe");
    const preferenceStatus = getElement("preferenceStatus");
    const mealResults = getElement("mealResults");

    const STORAGE_KEY = "foodflowCustomerPreferences";

    function getSavedPreferences() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            return null;
        }
    }

    function savePreferences(preferences) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
            return true;
        } catch (error) {
            return false;
        }
    }

    function loadPreferences() {
        const saved = getSavedPreferences();

        if (!saved) return;

        if (customerName && saved.name) {
            customerName.value = saved.name;
        }

        if (customerBudget && saved.budget !== undefined) {
            customerBudget.value = saved.budget;
        }

        if (customerMood && saved.mood) {
            customerMood.value = saved.mood;
        }

        if (foodPreference && saved.preference) {
            foodPreference.value = saved.preference;
        }

        if (dietaryNeed && saved.dietary) {
            dietaryNeed.value = saved.dietary;
        }

        if (rememberMe) {
            rememberMe.checked = true;
        }

        if (preferenceStatus) {
            preferenceStatus.textContent =
                "Welcome back! Your saved preferences are ready.";
        }
    }

    loadPreferences();

    function getCustomerPreferences() {
        return {
            name: customerName ? customerName.value.trim() : "",
            budget: customerBudget ? Number(customerBudget.value) : 150,
            mood: customerMood ? customerMood.value : "any",
            preference: foodPreference ? foodPreference.value : "both",
            dietary: dietaryNeed ? dietaryNeed.value : "none"
        };
    }

    function filterMeals(preferences) {
        return meals
            .filter((meal) => meal.price <= preferences.budget)
            .filter((meal) => {
                if (preferences.preference === "both") return true;

                return meal.category === preferences.preference;
            })
            .filter((meal) => {
                if (preferences.mood === "any") return true;

                return meal.moods.includes(preferences.mood);
            })
            .filter((meal) => {
                if (preferences.dietary === "none") return true;

                return meal.type === preferences.dietary;
            })
            .sort((a, b) => a.price - b.price);
    }

    // ==========================================
    // 5. DISPLAY MEAL RECOMMENDATIONS
    // ==========================================

    function renderMeals(results) {
        if (!mealResults) return;

        if (results.length === 0) {
            mealResults.innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 2rem;">🍽️</div>
                    <h3>No exact match found</h3>
                    <p>
                        Try increasing your budget or changing your food
                        preference, mood or dietary requirement.
                    </p>
                </div>
            `;
            return;
        }

        mealResults.innerHTML = results.map((meal, index) => `
            <article class="meal-card" style="animation-delay: ${index * 70}ms">
                <div class="meal-card-top">
                    <div>
                        <h3>${meal.emoji} ${meal.name}</h3>
                        <p>${meal.description}</p>
                    </div>

                    <span class="meal-price">₹${meal.price}</span>
                </div>

                <div class="meal-tags">
                    ${meal.tags.map((tag) => `
                        <span class="meal-tag">${tag}</span>
                    `).join("")}
                </div>

                <button
                    type="button"
                    class="meal-select-button"
                    data-meal-name="${meal.name}"
                    data-meal-price="${meal.price}"
                >
                    Choose this meal →
                </button>
            </article>
        `).join("");

        const disclaimer = document.createElement("p");
        disclaimer.className = "meal-disclaimer";
        disclaimer.textContent =
            "Demo recommendations only. Prices are illustrative and may not reflect actual restaurant prices.";

        mealResults.appendChild(disclaimer);
    }

    if (mealForm) {
        mealForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const preferences = getCustomerPreferences();

            if (
                !Number.isFinite(preferences.budget) ||
                preferences.budget <= 0
            ) {
                if (preferenceStatus) {
                    preferenceStatus.textContent =
                        "Please enter a valid budget greater than ₹0.";
                }

                if (customerBudget) {
                    customerBudget.focus();
                }

                return;
            }

            if (rememberMe && rememberMe.checked) {
                const saved = savePreferences(preferences);

                if (preferenceStatus) {
                    preferenceStatus.textContent = saved
                        ? "Your preferences have been saved for next time!"
                        : "Your meals are ready, but preferences could not be saved on this device.";
                }
            } else {
                try {
                    localStorage.removeItem(STORAGE_KEY);
                } catch (error) {
                    // Recommendations still work if storage is unavailable.
                }

                if (preferenceStatus) {
                    preferenceStatus.textContent =
                        "Here are recommendations based on your current choices.";
                }
            }

            const results = filterMeals(preferences);
            renderMeals(results);

            if (mealResults) {
                mealResults.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    }

    // ==========================================
    // 6. MEAL SELECTION
    // ==========================================

    if (mealResults) {
        mealResults.addEventListener("click", (event) => {
            const button = event.target.closest(".meal-select-button");

            if (!button) return;

            const mealName = button.dataset.mealName;
            const mealPrice = button.dataset.mealPrice;

            const actionResult = getElement("actionResult");

            if (actionResult) {
                showMessage(
                    actionResult,
                    `You selected ${mealName} for ₹${mealPrice}. This is a demo selection; no real order has been placed.`,
                    "success"
                );
            }

            const userMessage = getElement("userMessage");
            const chatMessages = getElement("chatMessages");

            if (userMessage) {
                userMessage.value =
                    `I selected ${mealName}. What should I know about my order?`;

                if (chatMessages) {
                    userMessage.focus();
                }
            }
        });
    }

    // ==========================================
    // 7. CUSTOMER SUPPORT CHAT
    // ==========================================

    const chatForm = getElement("chatForm");
    const userMessage = getElement("userMessage");
    const chatMessages = getElement("chatMessages");

    function addChatMessage(message, sender) {
        if (!chatMessages) return;

        const messageElement = document.createElement("div");

        messageElement.classList.add(
            sender === "user" ? "user-message" : "bot-message"
        );

        messageElement.textContent = message;

        chatMessages.appendChild(messageElement);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getBotReply(message) {
        const text = message.toLowerCase();

        if (
            text.includes("hello") ||
            text.includes("hi") ||
            text.includes("hey")
        ) {
            return "Hey there! 👋 I'm your FoodFlow AI demo assistant. You can ask me about meals, budgets, cancellation, refunds or order tracking.";
        }

        if (
            text.includes("remember") ||
            text.includes("preference") ||
            text.includes("repeat")
        ) {
            const saved = getSavedPreferences();

            if (saved) {
                return `I have saved preferences on this device${saved.name ? ` for ${saved.name}` : ""}. Your saved choices can be reused in the meal form. You can change them anytime.`;
            }

            return "You can tick 'Remember my preferences' in the meal form. I'll save your choices on this device so you don't have to enter them again next time.";
        }

        if (
            text.includes("budget") ||
            text.includes("cheap") ||
            text.includes("affordable") ||
            text.includes("money")
        ) {
            return "Let's keep it budget-friendly! 💰 Open Meal Agent, enter your maximum budget and I'll filter the sample menu to show meals within that amount.";
        }

        if (
            text.includes("mood") ||
            text.includes("sad") ||
            text.includes("tired") ||
            text.includes("stress")
        ) {
            return "Your mood matters! 😊 Use the mood selector in Meal Agent. I'll recommend sample meals matching your selected mood and budget.";
        }

        if (
            text.includes("cancel") ||
            text.includes("cancellation")
        ) {
            return "Cancellation policy: in this demo, cancellation eligibility depends on the timeline and order status defined by the restaurant. No real order is connected, so check the Policies section for the prototype's example terms.";
        }

        if (
            text.includes("refund") ||
            text.includes("money back") ||
            text.includes("return")
        ) {
            return "Refund policy: actual eligibility, processing time and refund method depend on the restaurant's policy and payment provider. This is a demo, so no real refund can be initiated. Check the Policies section for the example policy.";
        }

        if (
            text.includes("track") ||
            text.includes("where") ||
            text.includes("status") ||
            text.includes("delivery")
        ) {
            return "I can demonstrate order-tracking support, but this prototype isn't connected to a restaurant or live delivery service. Use the Track Order demo button in Customer Care.";
        }

        if (
            text.includes("human") ||
            text.includes("agent") ||
            text.includes("person") ||
            text.includes("support")
        ) {
            return "I can guide you through the demo support options. Use the Support Ticket demo button to see a sample ticket confirmation. It won't contact a real support agent.";
        }

        if (
            text.includes("menu") ||
            text.includes("food") ||
            text.includes("meal") ||
            text.includes("hungry")
        ) {
            return "Let's find something tasty! 🍜 Open Meal Agent, set your budget, choose your mood and food preference, and I'll show matching meals.";
        }

        return "I'm here to help! You can ask me about budget-friendly meals, saved preferences, mood-based suggestions, cancellation policies, refunds or demo order tracking.";
    }

    if (chatForm) {
        chatForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!userMessage) return;

            const message = userMessage.value.trim();

            if (!message) {
                userMessage.focus();
                return;
            }

            addChatMessage(message, "user");

            userMessage.value = "";

            window.setTimeout(() => {
                addChatMessage(getBotReply(message), "bot");
            }, 350);
        });
    }

    // ==========================================
    // 8. CUSTOMER CARE ACTIONS
    // ==========================================

    const trackButton = getElement("trackButton");
    const ticketButton = getElement("ticketButton");
    const humanButton = getElement("humanButton");

    if (trackButton) {
        trackButton.addEventListener("click", () => {
            const actionResult = getElement("actionResult");

            showMessage(
                actionResult,
                "📦 Demo tracking: Your sample order is awaiting confirmation. This prototype has no live order or delivery connection.",
                "success"
            );
        });
    }

    if (ticketButton) {
        ticketButton.addEventListener("click", () => {
            const actionResult = getElement("actionResult");

            const ticketNumber =
                "FF-DEMO-" + Math.floor(1000 + Math.random() * 9000);

            showMessage(
                actionResult,
                `🎫 Demo support ticket ${ticketNumber} created on screen. No ticket was sent to a real support team.`,
                "success"
            );
        });
    }

    if (humanButton) {
        humanButton.addEventListener("click", () => {
            const actionResult = getElement("actionResult");

            showMessage(
                actionResult,
                "👤 Human support is not connected in this prototype. In a production version, this action could connect customers to a real support channel.",
                "info"
            );
        });
    }

    // ==========================================
    // 9. REFUND POLICY DEMO
    // ==========================================

    const refundButton = getElement("refundButton");
    const refundResult = getElement("refundResult");

    if (refundButton) {
        refundButton.addEventListener("click", () => {
            showMessage(
                refundResult,
                "💳 Refund policy demo: Eligibility depends on the restaurant's terms, order status and payment method. No real refund can be requested through this prototype.",
                "info"
            );
        });
    }

    // ==========================================
    // 10. CANCELLATION POLICY DEMO
    // ==========================================

    const cancelButton = getElement("cancelButton");
    const cancellationResult = getElement("cancellationResult");

    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            showMessage(
                cancellationResult,
                "↩️ Cancellation policy demo: Whether an order can be cancelled depends on its status and the restaurant's stated time limit. No real order is connected to this prototype.",
                "info"
            );
        });
    }

    // ==========================================
    // 11. NAVIGATION LINKS
    // ==========================================

    $$('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (target) {
                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    // ==========================================
    // 12. INITIAL STATUS
    // ==========================================

    console.log("FoodFlow AI initialized successfully.");
});
/* FOODFLOW COMMAND CENTER ADD-ON */
(function () {
const toggle = document.getElementById("ff-command-toggle");
const panel = document.getElementById("ff-command-panel");
const close = document.getElementById("ff-command-close");
const message = document.getElementById("ff-command-message");

```
if (!toggle || !panel || !close || !message) {
    console.warn("FoodFlow Command Center: HTML elements not found.");
    return;
}

function setOpen(open) {
    panel.classList.toggle("ff-visible", open);
    panel.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
}

toggle.addEventListener("click", function () {
    setOpen(!panel.classList.contains("ff-visible"));
});

close.addEventListener("click", function () {
    setOpen(false);
});

panel.addEventListener("click", function (event) {
    const button = event.target.closest("[data-ff-action]");
    if (!button) return;

    const action = button.dataset.ffAction;

    const messages = {
        budget: "💸 Let's find a meal within your budget. Explore the meals and prices on the main menu.",
        mood: "❤️ What's your mood? Explore the available meals and choose what feels right.",
        surprise: "🎲 Surprise yourself! Explore the menu for your next favourite meal.",
        refund: "🛡️ Please review the cancellation and refund terms displayed on the main website before placing an order."
    };

    message.textContent = messages[action] || "Explore FoodFlow to find your next meal.";

    if (action === "budget" || action === "mood" || action === "surprise") {
        const candidates = [
            document.getElementById("menu"),
            document.getElementById("meals"),
            document.querySelector(".meal-card"),
            document.querySelector(".meal-grid")
        ];

        const target = candidates.find(function (element) {
            return element && element.getClientRects().length > 0;
        });

        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOpen(false);
});
```

})();