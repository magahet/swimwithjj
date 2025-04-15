import type { Page } from '@playwright/test';

/**
 * Interface representing the data tracked by the Firebase mocking
 */
export interface MockFirestoreData {
    createCalled: boolean;
    createWithIdCalled: boolean;
    lastCollection: string | null;
    lastDocId: string | null;
    lastData: any;
}

/**
 * Adds scripts to mock Firebase Firestore document creation functions
 * @param page - Playwright Page object
 */
export async function mockFirestoreCreation(page: Page): Promise<void> {
    // Set up mock for createDocument and createDocumentWithId functions
    await page.addInitScript(() => {
        // Initialize our tracking object in the window scope
        window._mockFirestoreData = {
            createCalled: false,
            createWithIdCalled: false,
            lastCollection: null,
            lastDocId: null,
            lastData: null
        };

        // We need to wait for the createDocument and createDocumentWithId 
        // functions to be defined, so create a MutationObserver to watch
        // for script execution
        const observer = new MutationObserver((mutations) => {
            // Check if the functions are now available in window scope
            if (typeof window.createDocument === 'function' ||
                typeof window.createDocumentWithId === 'function') {

                // Store original functions if they exist
                window._originalCreateDocument = window.createDocument;
                window._originalCreateDocumentWithId = window.createDocumentWithId;

                // Replace with our mocks
                if (typeof window.createDocument === 'function') {
                    window.createDocument = (collectionName, data) => {
                        console.log('Mocked createDocument called:', { collectionName, data });
                        window._mockFirestoreData.createCalled = true;
                        window._mockFirestoreData.lastCollection = collectionName;
                        window._mockFirestoreData.lastData = data;

                        // Return a promise with a mock document reference
                        return Promise.resolve({
                            id: 'mock-doc-id-' + Date.now(),
                        });
                    };
                }

                if (typeof window.createDocumentWithId === 'function') {
                    window.createDocumentWithId = (collectionName, docId, data) => {
                        console.log('Mocked createDocumentWithId called:', { collectionName, docId, data });
                        window._mockFirestoreData.createWithIdCalled = true;
                        window._mockFirestoreData.lastCollection = collectionName;
                        window._mockFirestoreData.lastDocId = docId;
                        window._mockFirestoreData.lastData = data;

                        // Return a promise that resolves successfully
                        return Promise.resolve();
                    };
                }

                // Disconnect once we've set up our mocks
                observer.disconnect();
            }
        });

        // Start observing
        observer.observe(document, {
            childList: true,
            subtree: true
        });

        // Also hook into module imports
        // This is a more aggressive approach that will catch module imports
        const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
        Object.defineProperty(HTMLScriptElement.prototype, 'src', {
            set(value) {
                if (originalSrcDescriptor && originalSrcDescriptor.set) {
                    originalSrcDescriptor.set.call(this, value);
                }

                // Wait for the script to load and then check for our functions
                this.addEventListener('load', () => {
                    if (typeof window.createDocument === 'function') {
                        window._originalCreateDocument = window.createDocument;
                        window.createDocument = (collectionName, data) => {
                            console.log('Mocked createDocument called:', { collectionName, data });
                            window._mockFirestoreData.createCalled = true;
                            window._mockFirestoreData.lastCollection = collectionName;
                            window._mockFirestoreData.lastData = data;

                            // Return a promise with a mock document reference
                            return Promise.resolve({
                                id: 'mock-doc-id-' + Date.now(),
                            });
                        };
                    }

                    if (typeof window.createDocumentWithId === 'function') {
                        window._originalCreateDocumentWithId = window.createDocumentWithId;
                        window.createDocumentWithId = (collectionName, docId, data) => {
                            console.log('Mocked createDocumentWithId called:', { collectionName, docId, data });
                            window._mockFirestoreData.createWithIdCalled = true;
                            window._mockFirestoreData.lastCollection = collectionName;
                            window._mockFirestoreData.lastDocId = docId;
                            window._mockFirestoreData.lastData = data;

                            // Return a promise that resolves successfully
                            return Promise.resolve();
                        };
                    }
                });
            },
            get() {
                return originalSrcDescriptor && originalSrcDescriptor.get
                    ? originalSrcDescriptor.get.call(this)
                    : '';
            }
        });
    });

    // Evaluate script to define mock functions directly in page context
    await page.evaluate(() => {
        // Define the mock functions directly in the page context
        window.createDocument = (collectionName, data) => {
            console.log('Direct mocked createDocument called:', { collectionName, data });
            if (!window._mockFirestoreData) {
                window._mockFirestoreData = {
                    createCalled: false,
                    createWithIdCalled: false,
                    lastCollection: null,
                    lastDocId: null,
                    lastData: null
                };
            }
            window._mockFirestoreData.createCalled = true;
            window._mockFirestoreData.lastCollection = collectionName;
            window._mockFirestoreData.lastData = data;

            // Return a promise with a mock document reference
            return Promise.resolve({
                id: 'mock-doc-id-' + Date.now(),
            });
        };

        window.createDocumentWithId = (collectionName, docId, data) => {
            console.log('Direct mocked createDocumentWithId called:', { collectionName, docId, data });
            if (!window._mockFirestoreData) {
                window._mockFirestoreData = {
                    createCalled: false,
                    createWithIdCalled: false,
                    lastCollection: null,
                    lastDocId: null,
                    lastData: null
                };
            }
            window._mockFirestoreData.createWithIdCalled = true;
            window._mockFirestoreData.lastCollection = collectionName;
            window._mockFirestoreData.lastDocId = docId;
            window._mockFirestoreData.lastData = data;

            // Return a promise that resolves successfully
            return Promise.resolve();
        };
    });
}

/**
 * Retrieves the tracked mock Firestore data from the page
 * @param page - Playwright Page object
 * @returns The collected mock data
 */
export async function getMockFirestoreData(page: Page): Promise<MockFirestoreData> {
    return await page.evaluate(() => window._mockFirestoreData);
}

/**
 * Mocks Stripe payment processing in the signup form
 * @param page - Playwright Page object 
 */
export async function mockStripePayment(page: Page): Promise<void> {
    await page.evaluate(() => {
        // Set a mock payment method ID
        const mockPaymentMethodId = 'pm_mock_' + Date.now();
        localStorage.setItem('stripePaymentMethodId', mockPaymentMethodId);

        // Make sure the form thinks it has valid payment information
        const form = document.querySelector('#signup-form') as HTMLFormElement;
        if (form) {
            form.dataset.paymentComplete = 'true';
        }
    });
}

/**
 * Mocks session selection for a child in the signup form
 * @param page - Playwright Page object
 * @param childIndex - Index of the child (1-based)
 * @param sessions - Array of session objects to be added
 */
export async function mockSessionSelection(
    page: Page,
    childIndex: number = 1,
    sessions: Array<{ id: string, name: string, dates: string[], time: string }> = [
        {
            id: 'mock-session-1',
            name: 'Mock Session 1',
            dates: ['2023-06-01', '2023-06-02'],
            time: '10:00 AM - 10:30 AM'
        }
    ]
): Promise<void> {
    await page.evaluate(({ childIndex, sessions }) => {
        // Set the value of the hidden input
        const sessionsInput = document.querySelector(`#child-sessions-${childIndex}`) as HTMLInputElement;
        if (sessionsInput) {
            sessionsInput.value = JSON.stringify(sessions);
        }

        // Update the UI to show the selected sessions
        const sessionsList = document.querySelector(`.sessions-list[data-child-index="${childIndex}"]`);
        const noSessionsSelected = document.querySelector(`.no-sessions-selected[data-child-index="${childIndex}"]`);

        if (sessionsList && noSessionsSelected) {
            // Create HTML for each session
            const sessionsHtml = sessions.map(session =>
                `<div class="bg-blue-100 p-2 rounded mb-2">${session.name}</div>`
            ).join('');

            sessionsList.innerHTML = sessionsHtml;
            sessionsList.classList.remove('hidden');
            noSessionsSelected.classList.add('hidden');
        }
    }, { childIndex, sessions });
}

// Extend Window interface to include our mock properties
declare global {
    interface Window {
        createDocument: (collectionName: string, data: any) => Promise<{ id: string }>;
        createDocumentWithId: (collectionName: string, docId: string, data: any) => Promise<void>;
        _originalCreateDocument: any;
        _originalCreateDocumentWithId: any;
        _mockFirestoreData: MockFirestoreData;
    }
} 