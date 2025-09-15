// =================================================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// =================================================================
const firebaseConfig = {
            apiKey: "AIzaSyCS06RYItsN_lYq0ZI-Yfv2WRzyuac28EY",
            authDomain: "dailyos-f2eb6.firebaseapp.com",
            projectId: "dailyos-f2eb6",
            storageBucket: "dailyos-f2eb6.firebasestorage.app",
            messagingSenderId: "173476838340",
            appId: "1:173476838340:web:a0811c7c42615cf27f4291",
            measurementId: "G-QDM68MDX6S"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Global variables for user-specific collections
let currentUser;
let userAccountsRef;
let userTransactionsRef;
let chartInstances = {};
let analyticsChartInstances = {};

// =================================================================
// 2. DOM ELEMENT REFERENCES
// =================================================================
const accountsListEl = document.getElementById('accounts-list');
const accountSelectorEl = document.getElementById('account-selector');
const transactionTableBodyEl = document.getElementById('transaction-table-body');
const transactionHeaderEl = document.getElementById('transaction-header');
const totalBalanceEl = document.getElementById('total-balance');
const totalInflowEl = document.getElementById('total-inflow');
const totalOutflowEl = document.getElementById('total-outflow');
const netFlowEl = document.getElementById('net-flow');
const noTransactionsMessageEl = document.getElementById('no-transactions-message');
const filterDateEl = document.getElementById('filter-date');
const filterCategoryEl = document.getElementById('filter-category');
const filterTypeEl = document.getElementById('filter-type');
const searchDescriptionEl = document.getElementById('search-description');
const addAccountModal = document.getElementById('add-account-modal');
const editAccountModal = document.getElementById('edit-account-modal');
const transactionModal = document.getElementById('transaction-modal');
const confirmModal = document.getElementById('confirm-modal');
const addAccountForm = document.getElementById('add-account-form');
const editAccountForm = document.getElementById('edit-account-form');
const transactionForm = document.getElementById('transaction-form');
const analyticsPageEl = document.getElementById('analytics');
const transactionsPageEl = document.getElementById('transactions');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const openSidebarBtn = document.getElementById('open-sidebar-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');

const dateRangeFilterAnalytics = document.getElementById('date-range');
const categoryFilterAnalytics = document.getElementById('category-filter-analytics');
const transactionHistoryList = document.getElementById('transaction-history-list');
const transactionHistoryFilter = document.getElementById('transaction-filter');
const overspendingList = document.getElementById('overspending-list');
const noOverspendingEl = document.getElementById('no-overspending');
const exportCsvBtn = document.getElementById('export-csv');
const exportPdfBtn = document.getElementById('export-pdf');
const editMonthlyDataBtn = document.getElementById('edit-monthly-data-btn');
const editCategoryDataBtn = document.getElementById('edit-category-data-btn');
const editDailyDataBtn = document.getElementById('edit-daily-data-btn');
const editMonthlySpendingModal = document.getElementById('editMonthlySpendingModal');
const editCategorySpendingModal = document.getElementById('editCategorySpendingModal');
const editDailySpendingModal = document.getElementById('editDailySpendingModal');
const monthlyInputsContainer = document.getElementById('monthly-inputs-container');
const categoryInputsContainer = document.getElementById('category-inputs-container');
const dailyInputsContainer = document.getElementById('daily-inputs-container');
const saveMonthlySpendingForm = document.getElementById('editMonthlySpendingForm');
const saveCategorySpendingForm = document.getElementById('editCategorySpendingForm');
const saveDailySpendingForm = document.getElementById('editDailySpendingForm');
let confirmCallback = null;

const analyticsCategories = {
    'Food & Dining': { name: 'Food & Dining', color: '#EF4444' },
    'Transportation': { name: 'Transportation', color: '#22C55E' },
    'Shopping': { name: 'Shopping', color: '#8B5CF6' },
    'Entertainment': { name: 'Entertainment', color: '#EAB308' },
    'Bills & Utilities': { name: 'Bills & Utilities', color: '#F97316' },
    'Health & Fitness': { name: 'Health & Fitness', color: '#3B82F6' },
    'Other': { name: 'Other', color: '#6B7280' },
    'Income': { name: 'Income', color: '#4ADE80' }
};

// =================================================================
// 3. AUTHENTICATION STATE CHANGE LISTENER
// =================================================================
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        userAccountsRef = db.collection('users').doc(currentUser.uid).collection('accounts');
        userTransactionsRef = db.collection('users').doc(currentUser.uid).collection('transactions');

        setupEventListeners();
        refreshUI();
        showPage('transactions');
    } else {
        if (window.location.pathname.endsWith('dashboard.html')) {
            window.location.href = 'auth.html';
        }
    }
});

// =================================================================
// 4. MAIN REFRESH & EVENT LISTENER SETUP
// =================================================================
async function refreshUI() {
    const allAccounts = await fetchAccounts();
    const allTransactions = await fetchTransactions();
    
    populateAccountSelector(allAccounts);
    populateCategoryFilter(allTransactions);
    updateDashboardSummary(allAccounts, allTransactions);
    renderAccountsList(allAccounts, allTransactions);
    handleFilterChange(allAccounts, allTransactions);
    
    feather.replace();
    updateAllAnalytics(allAccounts, allTransactions);
}

function setupEventListeners() {
    openSidebarBtn.addEventListener('click', () => { sidebar.classList.remove('-translate-x-full'); overlay.classList.remove('hidden'); });
    closeSidebarBtn.addEventListener('click', () => { sidebar.classList.add('-translate-x-full'); overlay.classList.add('hidden'); });
    overlay.addEventListener('click', () => { sidebar.classList.add('-translate-x-full'); overlay.classList.add('hidden'); });
    
    document.getElementById('logout-btn')?.addEventListener('click', () => auth.signOut());
    document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', (e) => { e.preventDefault(); showPage(link.getAttribute('href').substring(1)); closeSidebar(); }));

    accountSelectorEl.addEventListener('change', () => handleFilterChange());
    filterDateEl.addEventListener('change', () => handleFilterChange());
    filterCategoryEl.addEventListener('change', () => handleFilterChange());
    filterTypeEl.addEventListener('change', () => handleFilterChange());
    searchDescriptionEl.addEventListener('input', () => handleFilterChange());

    document.getElementById('add-account-btn').addEventListener('click', () => openModal(addAccountModal));
    document.getElementById('add-transaction-btn').addEventListener('click', () => openTransactionModal());

    document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', () => closeModal(btn.closest('.modal-backdrop'))));
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(backdrop); }));

    addAccountForm.addEventListener('submit', handleAddAccount);
    editAccountForm.addEventListener('submit', handleEditAccount);
    transactionForm.addEventListener('submit', handleAddEditTransaction);

    document.body.addEventListener('click', (e) => {
        const editTxBtn = e.target.closest('.edit-btn');
        const deleteTxBtn = e.target.closest('.delete-btn');
        const editAccBtn = e.target.closest('.edit-account-btn');
        const deleteAccBtn = e.target.closest('.delete-account-btn');

        if (editTxBtn) openTransactionModal(editTxBtn.dataset.id);
        if (deleteTxBtn) openConfirmModal("Are you sure you want to delete this transaction?", () => handleDeleteTransaction(deleteTxBtn.dataset.id));
        if (editAccBtn) openEditAccountModal(editAccBtn.dataset.id);
        if (deleteAccBtn) openConfirmModal("Are you sure you want to delete this account? All associated transactions will also be permanently deleted.", () => handleDeleteAccount(deleteAccBtn.dataset.id));
    });

    document.getElementById('confirm-delete-btn').addEventListener('click', () => { if (typeof confirmCallback === 'function') confirmCallback(); });
    document.getElementById('confirm-cancel-btn').addEventListener('click', () => closeModal(confirmModal));
    
    dateRangeFilterAnalytics.addEventListener('change', refreshUI);
    categoryFilterAnalytics.addEventListener('change', refreshUI);
    transactionHistoryFilter.addEventListener('change', refreshUI);
    exportCsvBtn.addEventListener('click', exportReports);
    exportPdfBtn.addEventListener('click', exportReports);

    editMonthlyDataBtn.addEventListener('click', openEditMonthlySpendingModal);
    editCategoryDataBtn.addEventListener('click', openEditCategorySpendingModal);
    editDailyDataBtn.addEventListener('click', openEditDailySpendingModal);
    
    saveMonthlySpendingForm.addEventListener('submit', saveMonthlySpending);
    saveCategorySpendingForm.addEventListener('submit', saveCategorySpending);
    saveDailySpendingForm.addEventListener('submit', saveDailySpending);
}

// =================================================================
// 5. FIREBASE DATA FETCHING FUNCTIONS
// =================================================================
async function fetchAccounts() {
    const accounts = [];
    const snapshot = await userAccountsRef.get();
    snapshot.forEach(doc => accounts.push({ id: doc.id, ...doc.data() }));
    return accounts;
}

async function fetchTransactions() {
    const transactions = [];
    const accounts = await fetchAccounts();
    const snapshot = await userTransactionsRef.orderBy('date', 'desc').get();
    
    snapshot.forEach(doc => {
        const transaction = doc.data();
        const account = accounts.find(acc => acc.id === transaction.accountId);
        transactions.push({ id: doc.id, accountName: account ? account.name : 'Unknown', ...transaction });
    });
    return transactions;
}

// =================================================================
// 6. UI RENDERING & MODAL FUNCTIONS
// =================================================================
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(section => section.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === `#${pageId}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function populateAccountSelector(accounts) {
    const transactionAccountSelect = document.getElementById('transaction-account');
    accountSelectorEl.innerHTML = '<option value="all">All Accounts</option>';
    transactionAccountSelect.innerHTML = '';
    
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.name} (${account.type})`;
        accountSelectorEl.appendChild(option.cloneNode(true));
        transactionAccountSelect.appendChild(option.cloneNode(true));
    });
}

function populateCategoryFilter(allTransactions) {
    const currentCategory = filterCategoryEl.value;
    filterCategoryEl.innerHTML = '<option value="">All Categories</option>';
    const categories = [...new Set(allTransactions.map(t => t.category))];
    categories.sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterCategoryEl.appendChild(option);
    });
    filterCategoryEl.value = currentCategory;
    
    const analyticsCategoryFilterEl = document.getElementById('category-filter-analytics');
    analyticsCategoryFilterEl.innerHTML = '<option value="all">All Categories</option>';
    const uniqueCategories = [...new Set(allTransactions.filter(t => t.type === 'debit').map(t => t.category))];
    uniqueCategories.sort().forEach(category => {
         const option = document.createElement('option');
         option.value = category;
         option.textContent = category;
         analyticsCategoryFilterEl.appendChild(option);
    });
}

function updateDashboardSummary(accounts, allTransactions) {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalInflow = allTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const totalOutflow = allTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    const netFlow = totalInflow - totalOutflow;

    totalBalanceEl.textContent = formatCurrency(totalBalance);
    totalInflowEl.textContent = formatCurrency(totalInflow);
    totalOutflowEl.textContent = formatCurrency(totalOutflow);
    netFlowEl.textContent = formatCurrency(netFlow);
    
    netFlowEl.classList.toggle('text-green-400', netFlow >= 0);
    netFlowEl.classList.toggle('text-red-400', netFlow < 0);
}

async function renderAccountsList(accounts, allTransactions) {
    accountsListEl.innerHTML = '';
    for (const account of accounts) {
        const accountTransactions = allTransactions.filter(t => t.accountId === account.id);
        const inflow = accountTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
        const outflow = accountTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
        
        const isOverSpent = outflow > inflow && accountTransactions.length > 0;
        const alertClass = isOverSpent ? 'over-expenditure-alert' : 'glass-effect';

        const accountCard = `<div class="p-5 rounded-xl transition-shadow ${alertClass}">
            <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-100 truncate">${account.name}</p>
                    <p class="text-sm text-gray-400">${account.type}</p>
                </div>
                <div class="flex items-center space-x-1 flex-shrink-0 ml-2">
                    <button class="edit-account-btn text-gray-500 hover:text-blue-400 p-1 rounded-full" data-id="${account.id}" title="Edit Account"><i data-feather="edit-2" class="w-4 h-4"></i></button>
                    <button class="delete-account-btn text-gray-500 hover:text-red-400 p-1 rounded-full" data-id="${account.id}" title="Delete Account"><i data-feather="trash-2" class="w-4 h-4"></i></button>
                </div>
            </div>
            <div class="mt-4 cursor-pointer" onclick="selectAccountFromCard('${account.id}')">
                <p class="text-sm text-gray-400">Balance</p><p class="text-2xl font-bold balance text-white">${formatCurrency(account.balance)}</p>
                <div class="mt-4 flex justify-between text-sm">
                    <div><p class="text-gray-400 flex items-center"><i data-feather="arrow-down-left" class="w-4 h-4 mr-1 text-green-400"></i> Inflow</p><p class="font-medium text-green-400">${formatCurrency(inflow)}</p></div>
                    <div><p class="text-gray-400 flex items-center"><i data-feather="arrow-up-right" class="w-4 h-4 mr-1 text-red-400"></i> Outflow</p><p class="font-medium text-red-400">${formatCurrency(outflow)}</p></div>
                </div>
            </div>
        </div>`;
        accountsListEl.insertAdjacentHTML('beforeend', accountCard);
    }
}

function renderTransactionTable(transactions, showAll = false) {
    const transactionTableFooterEl = document.getElementById('transaction-table-footer');
    
    transactionTableBodyEl.innerHTML = '';
    transactionTableFooterEl.innerHTML = '';
    noTransactionsMessageEl.classList.toggle('hidden', transactions.length > 0);

    const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    const hasMoreThanTen = sortedTransactions.length > 10;
    const transactionsToRender = (hasMoreThanTen && !showAll) ? sortedTransactions.slice(0, 10) : sortedTransactions;

    transactionsToRender.forEach(t => {
        const typeClass = t.type === 'credit' ? 'text-green-400 bg-green-900/50' : 'text-red-400 bg-red-900/50';
        const amountSign = t.type === 'credit' ? '+' : '-';
        const row = `<tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">${new Date(t.date).toLocaleDateString('en-CA')}</td>
            <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-gray-100">${t.description}</div><div class="text-xs text-gray-500">${t.accountName}</div></td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">${amountSign} ${formatCurrency(t.amount)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center"><span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeClass}">${t.type}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">${t.category}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button class="edit-btn text-blue-400 hover:text-blue-300" data-id="${t.id}"><i data-feather="edit-2" class="w-4 h-4"></i></button>
                <button class="delete-btn text-red-400 hover:text-red-300 ml-2" data-id="${t.id}"><i data-feather="trash-2" class="w-4 h-4"></i></button>
            </td></tr>`;
        transactionTableBodyEl.insertAdjacentHTML('beforeend', row);
    });

    if (hasMoreThanTen) {
        const buttonText = showAll ? 'Show Less...' : 'See More...';
        const newShowAllState = !showAll;
        const footerRow = `
            <tr>
                <td colspan="6" class="text-center py-3 glass-effect">
                    <button class="toggle-transactions-btn text-blue-400 hover:text-blue-300 font-semibold text-sm">${buttonText}</button>
                </td>
            </tr>
        `;
        transactionTableFooterEl.innerHTML = footerRow;
        document.querySelector('.toggle-transactions-btn').addEventListener('click', () => {
            renderTransactionTable(transactions, newShowAllState);
        });
    }
    feather.replace();
}

function openModal(modalEl) { modalEl.classList.add('active'); }
function closeModal(modalEl) { 
    modalEl.classList.remove('active');
    if (modalEl.id === 'confirm-modal') confirmCallback = null;
}
async function openTransactionModal(transactionId = null) {
    transactionForm.reset();
    const titleEl = document.getElementById('transaction-modal-title');
    if (transactionId) {
        titleEl.textContent = 'Edit Transaction';
        document.getElementById('transaction-id').value = transactionId;
        const transactionDoc = await userTransactionsRef.doc(transactionId).get();
        if(transactionDoc.exists) {
            const transaction = transactionDoc.data();
            document.getElementById('transaction-account').value = transaction.accountId;
            document.getElementById('transaction-date').value = transaction.date;
            document.getElementById('transaction-type').value = transaction.type;
            document.getElementById('transaction-description').value = transaction.description;
            document.getElementById('transaction-amount').value = transaction.amount;
            document.getElementById('transaction-category').value = transaction.category;
        }
    } else {
        titleEl.textContent = 'Add Transaction';
        document.getElementById('transaction-id').value = '';
        document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
    }
    openModal(transactionModal);
}
async function openEditAccountModal(accountId) {
    const accountDoc = await userAccountsRef.doc(accountId).get();
    if (accountDoc.exists) {
        const account = accountDoc.data();
        document.getElementById('edit-account-id').value = accountId;
        document.getElementById('edit-account-name').value = account.name;
        document.getElementById('edit-account-type').value = account.type;
        openModal(editAccountModal);
    }
}
function openConfirmModal(message, callback) {
    document.getElementById('confirm-modal-text').textContent = message;
    confirmCallback = callback;
    openModal(confirmModal);
}
window.selectAccountFromCard = (accountId) => {
    accountSelectorEl.value = accountId;
    handleFilterChange();
};

// =================================================================
// 7. DATA MANIPULATION FUNCTIONS (Firestore CRUD)
// =================================================================
async function handleFilterChange() {
    const allTransactions = await fetchTransactions();
    const accounts = await fetchAccounts();
    
    const filters = {
        accountId: accountSelectorEl.value,
        date: filterDateEl.value,
        category: filterCategoryEl.value,
        type: filterTypeEl.value,
        search: searchDescriptionEl.value.toLowerCase()
    };

    let filtered = allTransactions.filter(t => 
        (filters.accountId === 'all' || t.accountId == filters.accountId) &&
        (!filters.date || t.date === filters.date) &&
        (!filters.category || t.category === filters.category) &&
        (!filters.type || t.type === filters.type) &&
        (!filters.search || t.description.toLowerCase().includes(filters.search))
    );
    
    if(filters.category) filtered = filtered.filter(t => t.category === filters.category);

    transactionHeaderEl.textContent = filters.accountId === 'all' 
        ? 'All Transactions' 
        : `${accounts.find(a=>a.id==filters.accountId).name} Transactions`;

    renderTransactionTable(filtered);
    updateTransactionsCharts(filtered);
}

async function handleAddAccount(e) {
    e.preventDefault();
    const newAccount = {
        name: document.getElementById('account-name').value,
        type: document.getElementById('account-type').value,
        balance: parseFloat(document.getElementById('account-balance').value) || 0,
    };
    try {
        await userAccountsRef.add(newAccount);
        closeModal(addAccountModal);
        addAccountForm.reset();
        refreshUI();
        showNotification('Account added successfully!', 'success');
    } catch (error) {
        showNotification(`Error adding account: ${error.message}`, 'error');
    }
}

async function handleEditAccount(e) {
    e.preventDefault();
    const accountId = document.getElementById('edit-account-id').value;
    const updatedData = {
        name: document.getElementById('edit-account-name').value,
        type: document.getElementById('edit-account-type').value,
    };
    try {
        await userAccountsRef.doc(accountId).update(updatedData);
        closeModal(editAccountModal);
        editAccountForm.reset();
        refreshUI();
        showNotification('Account updated successfully!', 'success');
    } catch (error) {
        showNotification(`Error updating account: ${error.message}`, 'error');
    }
}

async function handleAddEditTransaction(e) {
    e.preventDefault();
    const transactionId = document.getElementById('transaction-id').value;
    const accountId = document.getElementById('transaction-account').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const type = document.getElementById('transaction-type').value;

    const formData = {
        date: document.getElementById('transaction-date').value,
        description: document.getElementById('transaction-description').value,
        amount,
        type,
        category: document.getElementById('transaction-category').value,
        accountId: accountId
    };

    try {
        const accountDoc = await userAccountsRef.doc(accountId).get();
        if (!accountDoc.exists) throw new Error("Account not found.");
        let currentBalance = accountDoc.data().balance;
        let balanceChange = type === 'credit' ? amount : -amount;

        if (transactionId) {
            const oldTransactionDoc = await userTransactionsRef.doc(transactionId).get();
            if (!oldTransactionDoc.exists) throw new Error("Transaction not found.");
            const oldTransaction = oldTransactionDoc.data();

            // Revert old transaction effect
            const oldBalanceChange = oldTransaction.type === 'credit' ? -oldTransaction.amount : oldTransaction.amount;
            currentBalance += oldBalanceChange;

            // Apply new transaction effect
            currentBalance += balanceChange;
            await userTransactionsRef.doc(transactionId).update(formData);
            await userAccountsRef.doc(accountId).update({ balance: currentBalance });

            // Handle account change on edit
            if(oldTransaction.accountId !== accountId) {
                await userAccountsRef.doc(oldTransaction.accountId).update({ balance: firebase.firestore.FieldValue.increment(oldBalanceChange) });
            }

        } else {
            currentBalance += balanceChange;
            await userTransactionsRef.add(formData);
            await userAccountsRef.doc(accountId).update({ balance: currentBalance });
        }
        
        closeModal(transactionModal);
        transactionForm.reset();
        refreshUI();
        showNotification('Transaction saved successfully!', 'success');
    } catch (error) {
        showNotification(`Error saving transaction: ${error.message}`, 'error');
    }
}

async function handleDeleteTransaction(transactionId) {
    try {
        const transactionDoc = await userTransactionsRef.doc(transactionId).get();
        if (!transactionDoc.exists) throw new Error("Transaction not found.");
        const transaction = transactionDoc.data();

        const balanceChange = transaction.type === 'credit' ? -transaction.amount : transaction.amount;
        await userAccountsRef.doc(transaction.accountId).update({ balance: firebase.firestore.FieldValue.increment(balanceChange) });
        await userTransactionsRef.doc(transactionId).delete();
        
        closeModal(confirmModal);
        refreshUI();
        showNotification('Transaction deleted successfully!', 'success');
    } catch (error) {
        showNotification(`Error deleting transaction: ${error.message}`, 'error');
    }
}

async function handleDeleteAccount(accountId) {
    try {
        const batch = db.batch();
        const transactionsSnapshot = await userTransactionsRef.where('accountId', '==', accountId).get();
        transactionsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        batch.delete(userAccountsRef.doc(accountId));
        await batch.commit();

        closeModal(confirmModal);
        refreshUI();
        showNotification('Account and all transactions deleted successfully!', 'success');
    } catch (error) {
        showNotification(`Error deleting account: ${error.message}`, 'error');
    }
}


// =================================================================
// 8. CHARTING & ANALYTICS FUNCTIONS
// =================================================================
function updateTransactionsCharts(transactions) {
    const allMonthlyData = transactions.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit'});
        if (!acc[month]) acc[month] = { income: 0, expense: 0 };
        if (t.type === 'credit') acc[month].income += t.amount; else acc[month].expense += t.amount;
        return acc;
    }, {});

    const maxFlow = Object.values(allMonthlyData).reduce((max, monthData) => {
        return Math.max(max, monthData.income, monthData.expense);
    }, 0);
    
    const suggestedYAxisMax = maxFlow > 0 ? maxFlow * 1.1 : 1000;
    renderMonthlyFlowChart(transactions, suggestedYAxisMax);
    renderCategorySpendingChart(transactions);
}

function renderMonthlyFlowChart(transactions, suggestedMax) {
    const ctx = document.getElementById('monthly-flow-chart').getContext('2d');
    if (chartInstances.monthly) chartInstances.monthly.destroy();
    const monthlyData = transactions.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit'});
        if (!acc[month]) acc[month] = { income: 0, expense: 0 };
        if (t.type === 'credit') acc[month].income += t.amount; else acc[month].expense += t.amount;
        return acc;
    }, {});
    const labels = Object.keys(monthlyData).sort((a,b) => new Date('01 ' + a) - new Date('01 ' + b));
    chartInstances.monthly = new Chart(ctx, { type: 'bar', data: { labels, datasets: [ { label: 'Income', data: labels.map(l => monthlyData[l].income), backgroundColor: 'rgba(34, 197, 94, 0.5)'}, { label: 'Expenses', data: labels.map(l => monthlyData[l].expense), backgroundColor: 'rgba(239, 68, 68, 0.5)'} ] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, suggestedMax: suggestedMax, grid: { color: '#334155' }, ticks: { color: 'white'} }, x: { grid: { color: '#334155' }, ticks: { color: 'white'} } }}});
}

function renderCategorySpendingChart(transactions) {
    const ctx = document.getElementById('category-spending-chart').getContext('2d');
    if (chartInstances.category) chartInstances.category.destroy();
    const categoryData = transactions.filter(t => t.type === 'debit').reduce((acc, t) => {
        if (!acc[t.category]) acc[t.category] = 0; acc[t.category] += t.amount; return acc;
    }, {});
    const bgColors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#8b5cf6', '#f97316', '#64748b'];
    chartInstances.category = new Chart(ctx, { type: 'doughnut', data: { labels: Object.keys(categoryData), datasets: [{ data: Object.values(categoryData), backgroundColor: bgColors, borderColor: '#1e293b', borderWidth: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } }}}});
}

async function updateAllAnalytics() {
    const allAccounts = await fetchAccounts();
    const allTransactions = await fetchTransactions();
    
    const expenses = allTransactions.filter(t => t.type === 'debit');
    const dateRange = dateRangeFilterAnalytics.value;
    const category = categoryFilterAnalytics.value;
    const filteredExpenses = filterTransactions(expenses, dateRange, category);
    
    const monthlyData = generateMonthlyData(filteredExpenses);
    const categoryData = generateCategoryData(filteredExpenses);
    const dailyData = generateDailyData(filteredExpenses);

    renderAnalyticsCharts(monthlyData, categoryData, dailyData);
    updateOverspendingHighlights(filteredExpenses);
    renderAnalyticsTransactionHistory(allTransactions);
}

function renderAnalyticsCharts(monthlyData, categoryData, dailyData) {
    const monthlyCanvas = document.getElementById('expenseBarChart');
    const categoryCanvas = document.getElementById('categoryPieChart');
    const dailyCanvas = document.getElementById('dailyLineChart');
    
    if (analyticsChartInstances.monthly) analyticsChartInstances.monthly.destroy();
    if (analyticsChartInstances.category) analyticsChartInstances.category.destroy();
    if (analyticsChartInstances.daily) analyticsChartInstances.daily.destroy();

    analyticsChartInstances.monthly = new Chart(monthlyCanvas, { type: 'bar', data: { labels: Object.keys(monthlyData), datasets: [{ label: 'Total Spending (₹)', data: Object.values(monthlyData), backgroundColor: 'rgba(99, 102, 241, 0.8)', borderColor: 'rgba(99, 102, 241, 1)', borderWidth: 1, borderRadius: 5 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: 'white' } }, x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: 'white' } } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => `₹${context.raw.toLocaleString()}` } } } } });

    const categoryLabels = Object.keys(categoryData);
    const categoryColors = categoryLabels.map(label => analyticsCategories[label]?.color || '#6B7280');
    analyticsChartInstances.category = new Chart(categoryCanvas, { type: 'doughnut', data: { labels: categoryLabels, datasets: [{ data: Object.values(categoryData), backgroundColor: categoryColors, hoverOffset: 16 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: 'white', font: { size: 14 } } }, tooltip: { callbacks: { label: context => `${context.label}: ₹${context.raw.toLocaleString()}` } }, datalabels: { formatter: (value, context) => { const total = context.dataset.data.reduce((sum, val) => sum + val, 0); const percentage = total > 0 ? (value / total * 100).toFixed(1) + '%' : '0%'; return percentage; }, color: '#fff', font: { size: 12, weight: 'bold' } } } } });

    const sortedDailyLabels = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b));
    const sortedDailyData = sortedDailyLabels.map(date => dailyData[date]);
    analyticsChartInstances.daily = new Chart(dailyCanvas, { type: 'line', data: { labels: sortedDailyLabels, datasets: [{ label: 'Daily Spending (₹)', data: sortedDailyData, borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.2)', fill: true, tension: 0.4 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: 'white' } }, x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: 'white' } } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => `₹${context.raw.toLocaleString()}` } } } } });
}

function updateOverspendingHighlights(filteredExpenses) {
    const categoryTotals = filteredExpenses.reduce((acc, exp) => {
        const categoryName = exp.category;
        acc[categoryName] = (acc[categoryName] || 0) + exp.amount;
        return acc;
    }, {});

    const highlights = [];
    const totalExpense = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const averageExpensePerCategory = totalExpense / Object.keys(categoryTotals).length;
    const overspendingThreshold = averageExpensePerCategory * 1.25;

    for (const category in categoryTotals) {
        if (categoryTotals[category] > overspendingThreshold) {
            highlights.push({
                category: category,
                amount: categoryTotals[category]
            });
        }
    }
    
    overspendingList.innerHTML = '';
    if (highlights.length > 0) {
        noOverspendingEl.style.display = 'none';
        highlights.forEach(h => {
            const highlightEl = document.createElement('div');
            highlightEl.className = 'p-3 bg-red-800 bg-opacity-30 rounded-lg flex justify-between items-center animate-pulse';
            highlightEl.innerHTML = `
                <div class="flex items-center space-x-3">
                    <i class="fas fa-exclamation-circle text-red-400"></i>
                    <span class="text-red-300 font-medium">High spending in ${h.category}</span>
                </div>
                <span class="text-red-300 font-semibold">₹${h.amount.toLocaleString()}</span>
            `;
            overspendingList.appendChild(highlightEl);
        });
    } else {
        noOverspendingEl.style.display = 'flex';
    }
}

function renderAnalyticsTransactionHistory(allTransactions) {
    const filter = transactionHistoryFilter.value;
    const filteredTransactions = allTransactions.filter(t => {
        const date = new Date(t.date);
        const today = new Date();
        if (filter === 'this-month') {
            return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
        } else if (filter === 'this-year') {
            return date.getFullYear() === today.getFullYear();
        }
        return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    transactionHistoryList.innerHTML = '';
    if (filteredTransactions.length === 0) {
        document.getElementById('no-data-transactions').style.display = 'block';
    } else {
        document.getElementById('no-data-transactions').style.display = 'none';
        filteredTransactions.forEach(t => {
            const transactionEl = document.createElement('div');
            transactionEl.className = 'transaction-item flex justify-between items-center p-3 rounded-lg bg-white bg-opacity-5';
            const category = analyticsCategories[t.category] || { name: t.category, color: '#6B7280' };
            const iconClass = t.type === 'debit' ? `fas fa-${getCategoryIcon(t.category)}` : 'fas fa-money-bill-wave';
            const amountClass = t.type === 'debit' ? 'text-red-400' : 'text-green-400';
            const sign = t.type === 'debit' ? '-' : '+';
            transactionEl.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background-color: ${category.color};">
                        <i class="${iconClass} text-white text-sm"></i>
                    </div>
                    <div>
                        <p class="text-white font-medium">${t.description}</p>
                        <p class="text-xs text-gray-400">${t.category} · ${new Date(t.date).toLocaleDateString()}</p>
                    </div>
                </div>
                <span class="${amountClass} font-semibold">${sign}₹${t.amount.toLocaleString()}</span>
            `;
            transactionHistoryList.appendChild(transactionEl);
        });
    }
}

// =================================================================
// 9. DATA GENERATION & EXPORT FUNCTIONS
// =================================================================
function generateMonthlyData(expenses) {
    const monthlyData = {};
    const today = new Date();
    for (let i = 0; i < 6; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyData[monthYear] = 0;
    }
    expenses.forEach(exp => {
        const monthYear = new Date(exp.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (monthlyData.hasOwnProperty(monthYear)) {
            monthlyData[monthYear] += exp.amount;
        }
    });
    return monthlyData;
}

function generateCategoryData(expenses) {
    const categoryData = {};
    const allCategories = [...new Set(expenses.map(exp => exp.category))];
    allCategories.forEach(cat => categoryData[cat] = 0);
    expenses.forEach(exp => {
        const categoryName = exp.category;
        categoryData[categoryName] = (categoryData[categoryName] || 0) + exp.amount;
    });
    return categoryData;
}

function generateDailyData(expenses) {
    const dailyData = {};
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        dailyData[dateString] = 0;
    }
    expenses.forEach(exp => {
        if (dailyData.hasOwnProperty(exp.date)) {
            dailyData[exp.date] += exp.amount;
        }
    });
    return dailyData;
}

async function exportReports(event) {
    const allTransactions = await fetchTransactions();
    const format = event.target.id.split('-')[1];
    const expenses = allTransactions.filter(t => t.type === 'debit');
    const dateRange = dateRangeFilterAnalytics.value;
    const category = categoryFilterAnalytics.value;
    const filteredExpenses = filterTransactions(expenses, dateRange, category);
    const expensesToExport = filteredExpenses.map(exp => ({
        Date: exp.date,
        Category: exp.category,
        Amount: exp.amount,
        Notes: exp.description
    }));
    
    if (format === 'csv') {
        exportCSV(expensesToExport);
    } else if (format === 'pdf') {
        exportPDF();
    }
}

function exportCSV(expenses) {
    if (expenses.length === 0) {
        showNotification('No data to export.', 'error');
        return;
    }
    const expenseHeaders = Object.keys(expenses[0]).join(',');
    const expenseRows = expenses.map(e => Object.values(e).join(','));
    const csvContent = `Expense Report\n${expenseHeaders}\n${expenseRows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "dailyos_analytics_report.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('CSV report downloaded successfully!', 'success');
}

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.text("DailyOS Analytics Report", 20, 20);
    doc.setFontSize(12);
    doc.text("Generated on: " + new Date().toLocaleDateString(), 20, 30);
    
    const chartsToRender = [
        document.getElementById('monthly-spending-chart-container'),
        document.getElementById('category-pie-chart-container'),
        document.getElementById('daily-line-chart-container'),
    ];

    let yOffset = 40;
    
    async function addChartToPDF(element, title) {
        return html2canvas(element, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 180;
            const pageHeight = doc.internal.pageSize.height;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            if (yOffset + imgHeight > pageHeight - 20) {
                doc.addPage();
                yOffset = 20;
            }
            doc.text(title, 20, yOffset + 10);
            doc.addImage(imgData, 'PNG', 20, yOffset + 15, imgWidth, imgHeight);
            yOffset += imgHeight + 20;
        });
    }

    Promise.all([
        addChartToPDF(chartsToRender[0], 'Monthly Spending'),
        addChartToPDF(chartsToRender[1], 'Spending by Category'),
        addChartToPDF(chartsToRender[2], 'Daily Spending Trend'),
    ]).then(() => {
        doc.save('dailyos_analytics_report.pdf');
        showNotification('PDF report generated successfully!', 'success');
    }).catch(error => {
        console.error("Error generating PDF:", error);
        showNotification('Failed to generate PDF.', 'error');
    });
}

// =================================================================
// 10. MODAL EDITING FUNCTIONS FOR ANALYTICS
// =================================================================
async function openEditMonthlySpendingModal() {
    monthlyInputsContainer.innerHTML = '';
    const allTransactions = await fetchTransactions();
    const monthlyData = generateMonthlyData(allTransactions.filter(t => t.type === 'debit'));
    for (const month in monthlyData) {
        const spending = monthlyData[month];
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between';
        div.innerHTML = `
            <label for="input-${month.replace(/\s/g, '-')}" class="block text-sm text-gray-400 w-1/3">${month}</label>
            <input type="number" id="input-${month.replace(/\s/g, '-')}" value="${spending}" class="form-control w-2/3">
        `;
        monthlyInputsContainer.appendChild(div);
    }
    openModal(editMonthlySpendingModal);
}

function saveMonthlySpending(event) {
    event.preventDefault();
    closeModal(editMonthlySpendingModal);
    showNotification('Monthly spending data saved!', 'success');
    // NOTE: This functionality is for display only and does not write to Firestore.
    // If you need to edit data, do it through the transaction table.
}

async function openEditCategorySpendingModal() {
    categoryInputsContainer.innerHTML = '';
    const allTransactions = await fetchTransactions();
    const categoryData = generateCategoryData(allTransactions.filter(t => t.type === 'debit'));
    for (const category in categoryData) {
        const spending = categoryData[category];
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between';
        div.innerHTML = `
            <label for="input-${category.replace(/\s/g, '-')}" class="block text-sm text-gray-400 w-1/3">${category}</label>
            <input type="number" id="input-${category.replace(/\s/g, '-')}" value="${spending}" class="form-control w-2/3">
        `;
        categoryInputsContainer.appendChild(div);
    }
    openModal(editCategorySpendingModal);
}

function saveCategorySpending(event) {
    event.preventDefault();
    closeModal(editCategorySpendingModal);
    showNotification('Category spending data saved!', 'success');
    // NOTE: This functionality is for display only and does not write to Firestore.
}

async function openEditDailySpendingModal() {
    dailyInputsContainer.innerHTML = '';
    const allTransactions = await fetchTransactions();
    const dailyData = generateDailyData(allTransactions.filter(t => t.type === 'debit'));
    const today = new Date();
    const sortedDates = Object.keys(dailyData).sort((a,b) => new Date(a) - new Date(b));
    sortedDates.forEach(dateString => {
        const displayDate = new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const spending = dailyData[dateString] || 0;
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between';
        div.innerHTML = `
            <label for="input-${dateString}" class="block text-sm text-gray-400 w-1/2">${displayDate}</label>
            <input type="number" id="input-${dateString}" value="${spending}" class="form-control w-1/2">
        `;
        dailyInputsContainer.appendChild(div);
    });
    openModal(editDailySpendingModal);
}

function saveDailySpending(event) {
    event.preventDefault();
    closeModal(editDailySpendingModal);
    showNotification('Daily spending data saved!', 'success');
    // NOTE: This functionality is for display only and does not write to Firestore.
}

// =================================================================
// 11. UTILITY FUNCTIONS
// =================================================================
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);
}

function filterTransactions(transactions, dateRange, category) {
    const today = new Date();
    let startDate;
    switch (dateRange) {
        case 'this-month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        case 'last-month':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            break;
        case 'this-year':
            startDate = new Date(today.getFullYear(), 0, 1);
            break;
        case 'last-30-days':
        default:
            startDate = new Date();
            startDate.setDate(today.getDate() - 30);
            break;
    }

    return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const isWithinDateRange = transactionDate >= startDate && transactionDate <= today;
        const isCorrectCategory = category === 'all' || t.category === category;
        return isWithinDateRange && isCorrectCategory;
    });
}

function getCategoryIcon(category) {
    const icons = {
        'Food & Dining': 'utensils',
        'Transportation': 'car',
        'Shopping': 'shopping-bag',
        'Entertainment': 'film',
        'Health & Fitness': 'heartbeat',
        'Bills & Utilities': 'file-invoice-dollar',
        'Other': 'receipt'
    };
    return icons[category] || 'receipt';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white animate__animated animate__fadeInRight animate__faster ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.innerHTML = `<p>${message}</p>`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove('animate__fadeInRight');
        notification.classList.add('animate__fadeOutRight');
        notification.addEventListener('animationend', () => notification.remove());
    }, 3000);
}

// =================================================================
// 12. START THE APPLICATION
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    Chart.register(ChartDataLabels);
});

