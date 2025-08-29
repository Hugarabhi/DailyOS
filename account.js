// DOM Elements
const addAccountBtn = document.getElementById('addAccountBtn');
const addAccountModal = document.getElementById('addAccountModal');
const cancelAddAccount = document.getElementById('cancelAddAccount');
const accountForm = document.getElementById('accountForm');
const tabs = document.querySelectorAll('.tab');
const accountsContainer = document.getElementById('accountsContainer');
const accountDetails = document.getElementById('accountDetails');

// Sample account data
let accounts = [
    {
        id: 1,
        name: "HDFC Bank",
        type: "savings",
        bank: "HDFC Bank",
        number: "•••• 4582",
        balance: 85452.75,
        currency: "₹",
        details: {
            accountNumber: "•••• •••• •••• 4582",
            accountType: "Savings Account",
            ifscCode: "HDFC0000123"
        },
        transactions: [
            {
                id: 1,
                name: "Amazon Purchase",
                date: "July 28, 2023",
                amount: -349.00,
                type: "expense",
                icon: "shopping-cart",
                iconColor: "blue"
            },
            {
                id: 2,
                name: "Salary Credit",
                date: "July 25, 2023",
                amount: 50000.00,
                type: "income",
                icon: "money-bill-wave",
                iconColor: "green"
            },
            {
                id: 3,
                name: "Restaurant Payment",
                date: "July 22, 2023",
                amount: -2125.00,
                type: "expense",
                icon: "utensils",
                iconColor: "red"
            }
        ]
    },
    {
        id: 2,
        name: "ICICI Bank Credit Card",
        type: "credit",
        bank: "ICICI Bank",
        number: "•••• 6721",
        balance: -12245.50,
        currency: "₹",
        creditLimit: 50000.00,
        transactions: [
            {
                id: 1,
                name: "Online Shopping",
                date: "July 26, 2023",
                amount: -5245.50,
                type: "expense",
                icon: "shopping-bag",
                iconColor: "purple"
            },
            {
                id: 2,
                name: "Payment Received",
                date: "July 20, 2023",
                amount: 7000.00,
                type: "income",
                icon: "credit-card",
                iconColor: "green"
            }
        ]
    }
];

// Current selected account
let selectedAccount = accounts[0];

// Event Listeners
addAccountBtn.addEventListener('click', () => {
    addAccountModal.style.display = 'flex';
});

cancelAddAccount.addEventListener('click', () => {
    addAccountModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === addAccountModal) {
        addAccountModal.style.display = 'none';
    }
});

// Tab functionality
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Filter accounts based on tab
        filterAccounts(tabId);
    });
});

// Form submission
accountForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const accountType = document.getElementById('accountType').value;
    const accountName = document.getElementById('accountName').value;
    const bankName = document.getElementById('bankName').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const initialBalance = parseFloat(document.getElementById('initialBalance').value);
    
    if (!accountType || !accountName || !bankName || !accountNumber || isNaN(initialBalance)) {
        alert('Please fill all fields with valid data');
        return;
    }
    
    // Create new account
    const newAccount = {
        id: accounts.length + 1,
        name: accountName,
        type: accountType,
        bank: bankName,
        number: `•••• ${accountNumber.slice(-4)}`,
        balance: initialBalance,
        currency: "₹",
        transactions: []
    };
    
    accounts.push(newAccount);
    
    // Reset form and close modal
    accountForm.reset();
    addAccountModal.style.display = 'none';
    
    // Refresh accounts display
    renderAccounts();
    renderAccountDetails(selectedAccount);
    
    alert('Account added successfully!');
});

// Function to format currency
function formatCurrency(amount, currency) {
    return `${currency}${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Function to render accounts
function renderAccounts() {
    accountsContainer.innerHTML = '';
    
    accounts.forEach(account => {
        const accountCard = document.createElement('div');
        accountCard.className = 'glass-effect p-6 account-card card-hover';
        accountCard.dataset.id = account.id;
        
        const iconClass = account.type === 'credit' ? 'fab fa-cc-mastercard' : 'fas fa-university';
        const iconBg = account.type === 'credit' ? 'bg-red-500' : 'bg-blue-500';
        
        accountCard.innerHTML = `
            <div class="flex items-center mb-4">
                <div class="w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center mr-4">
                    <i class="${iconClass} text-white text-xl"></i>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-white">${account.name}</h3>
                    <p class="text-gray-200">${account.type === 'credit' ? '' : 'Savings • '}${account.number}</p>
                </div>
            </div>
            <div class="mb-4">
                <h2 class="text-2xl font-bold ${account.balance < 0 ? 'text-red-400' : 'text-white'}">${formatCurrency(account.balance, account.currency)}</h2>
                <p class="text-gray-200">${account.type === 'credit' ? 'Current Balance' : 'Available Balance'}</p>
                ${account.creditLimit ? `<p class="text-gray-200">Credit Limit: ${formatCurrency(account.creditLimit, account.currency)}</p>` : ''}
            </div>
            <div class="flex justify-between">
                <button class="view-details text-blue-400 hover:text-blue-300">
                    <i class="fas fa-exchange-alt mr-1"></i> Transactions
                </button>
                <button class="text-gray-400 hover:text-white">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
        `;
        
        accountsContainer.appendChild(accountCard);
        
        // Add event listener to view details button
        const viewDetailsBtn = accountCard.querySelector('.view-details');
        viewDetailsBtn.addEventListener('click', () => {
            const accountId = parseInt(accountCard.dataset.id);
            selectedAccount = accounts.find(acc => acc.id === accountId);
            renderAccountDetails(selectedAccount);
        });
    });
}

// Function to render account details
function renderAccountDetails(account) {
    accountDetails.innerHTML = '';
    
    const detailsHtml = `
        <h2 class="text-xl font-bold text-white mb-4">Account Details - ${account.name}</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-white bg-opacity-10 p-4 rounded-lg">
                <p class="text-gray-200">Account Number</p>
                <p class="text-white font-semibold">${account.details?.accountNumber || 'Not available'}</p>
            </div>
            <div class="bg-white bg-opacity-10 p-4 rounded-lg">
                <p class="text-gray-200">Account Type</p>
                <p class="text-white font-semibold">${account.details?.accountType || 'Not available'}</p>
            </div>
            <div class="bg-white bg-opacity-10 p-4 rounded-lg">
                <p class="text-gray-200">${account.type === 'credit' ? 'Card Number' : 'IFSC Code'}</p>
                <p class="text-white font-semibold">${account.details?.ifscCode || 'Not available'}</p>
            </div>
        </div>
        
        <div class="mb-6">
            <h3 class="text-lg font-semibold text-white mb-3">Balance Over Time</h3>
            <div class="bg-white bg-opacity-10 p-4 rounded-lg h-40">
                <div class="flex items-end h-32 gap-2 justify-between">
                    <div class="flex flex-col items-center">
                        <div class="w-8 bg-blue-500 rounded-t" style="height: 40%;"></div>
                        <p class="text-xs text-gray-200 mt-2">Jan</p>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-8 bg-blue-500 rounded-t" style="height: 55%;"></div>
                        <p class="text-xs text-gray-200 mt-2">Feb</p>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-8 bg-blue-500 rounded-t" style="height: 35%;"></div>
                        <p class="text-xs text-gray-200 mt-2">Mar</p>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-8 bg-blue-500 rounded-t" style="height: 60%;"></div>
                        <p class="text-xs text-gray-200 mt-2">Apr</p>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-8 bg-blue-500 rounded-t" style="height: 75%;"></div>
                        <p class="text-xs text-gray-200 mt-2">May</p>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-8 bg-blue-500 rounded-t" style="height: 80%;"></div>
                        <p class="text-xs text-gray-200 mt-2">Jun</p>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-8 bg-blue-500 rounded-t" style="height: 100%;"></div>
                        <p class="text-xs text-gray-200 mt-2">Jul</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div>
            <h3 class="text-lg font-semibold text-white mb-3">Recent Transactions</h3>
            <div class="space-y-3" id="transactionsList">
                ${renderTransactions(account.transactions)}
            </div>
        </div>
    `;
    
    accountDetails.innerHTML = detailsHtml;
}

// Function to render transactions
function renderTransactions(transactions) {
    if (!transactions || transactions.length === 0) {
        return '<p class="text-gray-400 text-center py-4">No transactions found</p>';
    }
    
    return transactions.map(transaction => `
        <div class="transaction-item">
            <div class="flex items-center">
                <div class="w-10 h-10 bg-${transaction.iconColor}-100 rounded-full flex items-center justify-center mr-3">
                    <i class="fas fa-${transaction.icon} text-${transaction.iconColor}-600"></i>
                </div>
                <div>
                    <p class="font-medium text-white">${transaction.name}</p>
                    <p class="text-sm text-gray-300">${transaction.date}</p>
                </div>
            </div>
            <div class="${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount, '₹')}
            </div>
        </div>
    `).join('');
}

// Function to filter accounts based on tab
function filterAccounts(tabId) {
    let filteredAccounts = accounts;
    
    if (tabId !== 'all') {
        filteredAccounts = accounts.filter(account => {
            if (tabId === 'bank') return account.type === 'savings' || account.type === 'checking';
            if (tabId === 'credit') return account.type === 'credit';
            if (tabId === 'investment') return account.type === 'investment';
            if (tabId === 'loan') return account.type === 'loan';
            return true;
        });
    }
    
    // Re-render accounts with filtered list
    accountsContainer.innerHTML = '';
    
    if (filteredAccounts.length === 0) {
        accountsContainer.innerHTML = `
            <div class="glass-effect p-6 text-center col-span-full">
                <i class="fas fa-wallet text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-xl font-semibold text-white mb-2">No accounts found</h3>
                <p class="text-gray-400">You don't have any accounts of this type yet.</p>
            </div>
        `;
        return;
    }
    
    filteredAccounts.forEach(account => {
        const accountCard = document.createElement('div');
        accountCard.className = 'glass-effect p-6 account-card card-hover';
        accountCard.dataset.id = account.id;
        
        const iconClass = account.type === 'credit' ? 'fab fa-cc-mastercard' : 'fas fa-university';
        const iconBg = account.type === 'credit' ? 'bg-red-500' : 'bg-blue-500';
        
        accountCard.innerHTML = `
            <div class="flex items-center mb-4">
                <div class="w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center mr-4">
                    <i class="${iconClass} text-white text-xl"></i>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-white">${account.name}</h3>
                    <p class="text-gray-200">${account.type === 'credit' ? '' : 'Savings • '}${account.number}</p>
                </div>
            </div>
            <div class="mb-4">
                <h2 class="text-2xl font-bold ${account.balance < 0 ? 'text-red-400' : 'text-white'}">${formatCurrency(account.balance, account.currency)}</h2>
                <p class="text-gray-200">${account.type === 'credit' ? 'Current Balance' : 'Available Balance'}</p>
                ${account.creditLimit ? `<p class="text-gray-200">Credit Limit: ${formatCurrency(account.creditLimit, account.currency)}</p>` : ''}
            </div>
            <div class="flex justify-between">
                <button class="view-details text-blue-400 hover:text-blue-300">
                    <i class="fas fa-exchange-alt mr-1"></i> Transactions
                </button>
                <button class="text-gray-400 hover:text-white">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
        `;
        
        accountsContainer.appendChild(accountCard);
        
        // Add event listener to view details button
        const viewDetailsBtn = accountCard.querySelector('.view-details');
        viewDetailsBtn.addEventListener('click', () => {
            const accountId = parseInt(accountCard.dataset.id);
            selectedAccount = accounts.find(acc => acc.id === accountId);
            renderAccountDetails(selectedAccount);
        });
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    renderAccounts();
    renderAccountDetails(selectedAccount);
});