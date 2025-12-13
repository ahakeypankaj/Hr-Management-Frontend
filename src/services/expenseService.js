import api from './api'

export async function createExpense(expenseData) {
  try {
    const formData = new FormData();
    formData.append('expenseType', expenseData.category);
    formData.append('date', expenseData.date);
    formData.append('amount', expenseData.amount);
    formData.append('description', expenseData.description || expenseData.title);

    if (expenseData.receipt) {
      formData.append('receipts', expenseData.receipt);
    }

    const response = await api.post('/expenses/createExpense', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchExpenses() {
  try {
    const response = await api.get('/expenses/my');
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getExpenseSummary() {
  try {
    const response = await api.get('/expenses/summary');
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateExpenseStatus(expenseId, status) {
  try {
    const response = await api.put(`/expenses/${expenseId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function listExpensesByUser(page = 1, limit = 20) {
  try {
    const response = await api.get('/expenses/listExpensesByUser', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getPendingExpenses(expenseType = null, page = 1, limit = 20) {
  try {
    const params = { page, limit };
    if (expenseType) {
      params.expenseType = expenseType;
    }
    const response = await api.get('/expenses/pendingExpenses', { params });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function approveExpense(expenseId, comment = "") {
  try {
    const response = await api.patch(`/expenses/${expenseId}/approve`, {
      comment: comment
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function rejectExpense(expenseId, comment = "") {
  try {
    const response = await api.patch(`/expenses/${expenseId}/reject`, {
      comment: comment
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}