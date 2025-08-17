import React, { useState, useEffect } from 'react';
import {
  createIncomePayment,
  createExpensePayment,
  getCompletedTasks,
  getPaymentsDetails,
  getPaymentSummary,
  getAllUsers,
} from '../../servicecall/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Md18UpRating, MdMoney } from 'react-icons/md';
import { CurrencyDollarIcon, CreditCardIcon, PaperClipIcon, DocumentIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';


const getPaymentsOverview = async () => {
  try {
    const response = await getPaymentsDetails();
    return response;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to get payments details");
  }
};

const useCountUp = (end, duration = 1000, start = 0) => {
  const [count, setCount] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (end === 0) return;

    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = start;
    const change = end - start;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (change * easeOutCubic);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
  }, [end, duration, start]);

  return Math.round(count * 100) / 100;
};

const CounterCard = ({ title, value, color, prefix = "$" }) => {
  const animatedValue = useCountUp(value, 1000);
  const formattedValue = animatedValue.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const getAmountFontSize = (valueStr) => {
    if (valueStr.length <= 8) return 'text-2xl';
    if (valueStr.length <= 12) return 'text-xl';
    if (valueStr.length <= 16) return 'text-lg';
    return 'text-base';
  };

  const shouldBreakAmount = formattedValue.length > 12;

  return (
    <div className={`bg-white rounded-lg shadow border-l-4 border-${color}-500 p-4 hover:shadow-md transition-shadow`}>
      <div className="flex flex-col h-full">
        <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
        <div className="flex-1 flex items-center">
          {shouldBreakAmount ? (
            <div className="w-full">
              <div className={`font-bold text-${color}-600 leading-tight break-all`}>
                <span className="text-lg">{prefix}</span>
                <span className="text-base ml-1">{formattedValue}</span>
              </div>
            </div>
          ) : (
            <p className={`${getAmountFontSize(formattedValue)} font-bold text-${color}-600 break-all`}>
              {prefix}{formattedValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const CountUp = ({ end, duration = 1000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return count.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const PaymentDetailsModal = ({ payment, onClose }) => {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAttachments = (attachments) => {
    const hasTask = attachments?.task;
    const hasFiles = attachments?.files && attachments.files.length > 0;

    if (!hasTask && !hasFiles) {
      return <span className="text-gray-500 text-sm">No attachments</span>;
    }

    return (
      <div className="space-y-2">
        {hasTask && (
          <div className="bg-gray-50 p-2 rounded border">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">{payment.attachments.task.title || 'Task Attached'}</span>
            </div>
          </div>
        )}
        {hasFiles && (
          <div className="space-y-1">
            {payment.attachments.files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                <div className="flex items-center gap-2">
                  {file.fileType.startsWith('image/') && (
                    <img src={file.receiptFile} alt={file.fileName} className="h-6 w-6 rounded object-cover" />
                  )}
                  {file.fileType === 'application/pdf' && (
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 2a2 2 0 00-2 2v16c0 1.103.897 2 2 2h12a2 2 0 002-2V8.414A1.997 1.997 0 0019.414 7L15 2.586A1.994 1.994 0 0013.586 2H6z" />
                    </svg>
                  )}
                  <span className="text-sm text-gray-700 truncate">{file.fileName}</span>
                </div>
                <a
                  href={file.receiptFile}
                  download={file.fileName}
                  className="px-2 py-1 text-blue-600 text-xs hover:bg-blue-50"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const amount = payment.type === 'INCOME' ? payment.credit : payment.debit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[450px] flex overflow-hidden">
        
        <div className={`w-1/3 p-6 flex flex-col justify-center ${payment.type === 'INCOME' ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-center">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-2">
              {payment.type === 'INCOME' ? 'Income' : 'Expense'}
            </div>
            <div className={`text-4xl font-bold mb-2 ${payment.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
              ${payment.type === 'INCOME' ? '+' : '-'}<CountUp end={amount} />
            </div>
            <div className="text-sm text-gray-600">
              {formatDateTime(payment.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 tracking-wide mb-1">Description</label>
              <p className="text-sm text-gray-900">{payment.description || 'No description'}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 tracking-wide mb-1">Created By</label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {payment.createdBy.firstName[0]}{payment.createdBy.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.createdBy.firstName} {payment.createdBy.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{payment.createdBy.email}</p>
                </div>
              </div>
            </div>

            {payment.type === 'INCOME' && payment.users && payment.users.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Distribution</label>
                <div className="bg-gray-50 rounded border max-h-24 overflow-y-auto">
                  {payment.users.map((userEntry, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {userEntry.user.firstName[0]}{userEntry.user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            {userEntry.user.firstName} {userEntry.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{userEntry.user.email}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-green-600">
                        $<CountUp end={userEntry.amount} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 tracking-wide mb-2">Attachments</label>
              {renderAttachments(payment.attachments)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentSummaryTable = ({ payments, isLoading }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const truncateDescription = (description, maxLength = 50) => {
    if (!description) return 'N/A';
    return description.length > maxLength
      ? `${description.substring(0, maxLength)}...`
      : description;
  };

  const renderAttachments = (attachments) => {
    const hasTask = attachments?.task;
    const hasFiles = attachments?.files && attachments.files.length > 0;

    return (
      <div className="flex items-center gap-2">
        {hasTask && (
          <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-xs">
            <DocumentIcon className="w-3 h-3 text-blue-600" />
            <span className="text-blue-700">Task</span>
          </div>
        )}
        {hasFiles && (
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded text-xs">
            <PaperClipIcon className="w-3 h-3 text-green-600" />
            <span className="text-green-700">{attachments.files.length} file{attachments.files.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 text-center text-gray-500">
          Loading payment history...
        </div>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 text-center text-gray-500">
          No payment records found.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attachments
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => {
                const { date, time } = formatDate(payment.createdAt);
                return (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{date}</div>
                      <div>{time}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span title={payment.description}>
                        {truncateDescription(payment.description)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {payment.createdBy.firstName} {payment.createdBy.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.createdBy.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.credit > 0 && (
                        <span className="font-medium text-green-600">
                          ${payment.credit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.debit > 0 && (
                        <span className="font-medium text-red-600">
                          ${payment.debit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {renderAttachments(payment.attachments)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </>
  );
};

export const Payment = () => {
  const [modalType, setModalType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const [paymentData, setPaymentData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    userTotalIncome: 0,
    userTotalExpense: 0
  });
  const [overviewError, setOverviewError] = useState(null);

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const loggedInUserRole = userData.role;

  const [activeUsers, setActiveUsers] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [showUserList, setShowUserList] = useState(false);

  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    description: '',
    userIds: [],
  });
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    taskId: '',
  });
  const [expenseFiles, setExpenseFiles] = useState([]);

  useEffect(() => {
    const fetchOverview = async () => {
      setIsLoading(true);
      setOverviewError(null);
      try {
        const data = await getPaymentsOverview();
        setPaymentData(data);
      } catch (err) {
        setOverviewError('Failed to load payment overview. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

  useEffect(() => {
    const fetchPaymentSummary = async () => {
      setIsLoadingSummary(true);
      try {
        const data = await getPaymentSummary();
        setPaymentSummary(data || []);
      } catch (error) {
        toast.error('Failed to fetch payment summary.');
        setPaymentSummary([]);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    fetchPaymentSummary();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (modalType === 'income') {
          const users = await getAllUsers();
          setActiveUsers(users || []);
        } else if (modalType === 'expense') {
          const tasks = await getCompletedTasks();
          setMyTasks(tasks || []);
        }
      } catch (err) {
        toast.error('Failed to fetch data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (modalType) {
      fetchData();
    }
  }, [modalType]);

  const refreshData = async () => {
    try {
      const [overviewData, summaryData] = await Promise.all([
        getPaymentsOverview(),
        getPaymentSummary()
      ]);
      setPaymentData(overviewData);
      setPaymentSummary(summaryData || []);
    } catch (error) {
      toast.error('Failed to refresh data.');
    }
  };

  const closeModal = () => {
    setModalType(null);
    setIncomeForm({ amount: '', description: '', userIds: [] });
    setExpenseForm({ amount: '', description: '', taskId: '' });
    setExpenseFiles([]);
    setShowUserList(false);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setIncomeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUserToggle = userId => {
    setIncomeForm(prev => {
      const alreadySelected = prev.userIds.includes(userId);
      const userIds = alreadySelected
        ? prev.userIds.filter(id => id !== userId)
        : [...prev.userIds, userId];
      return { ...prev, userIds };
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const amount = parseFloat(incomeForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount greater than 0.');
      return;
    }
    if (incomeForm.userIds.length === 0) {
      toast.error('Please select at least one user.');
      return;
    }
    const payload = {
      amount,
      description: incomeForm.description || 'No description',
      userIds: incomeForm.userIds,
    };
    setIsLoading(true);
    try {
      await createIncomePayment(payload);
      toast.success('Income payment created successfully!');
      closeModal();
      await refreshData();
    } catch {
      toast.error('Failed to create income payment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpenseChange = e => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({ ...prev, [name]: value }));
  };

  const handleExpenseFileChange = e => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isValidType) toast.error(`${file.name} is not a valid file type (JPEG, PNG, PDF).`);
      if (!isValidSize) toast.error(`${file.name} exceeds 5MB limit.`);
      return isValidType && isValidSize;
    });
    setExpenseFiles(validFiles);
  };

  const handleExpenseSubmit = async e => {
    e.preventDefault();
    const amount = parseFloat(expenseForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount greater than 0.');
      return;
    }
    const payload = {
      amount,
      description: expenseForm.description || 'No description',
      taskId: expenseForm.taskId ? parseInt(expenseForm.taskId) : null,
    };
    setIsLoading(true);
    try {
      await createExpensePayment(payload, expenseFiles);
      toast.success('Expense payment created successfully!');
      closeModal();
      await refreshData();
    } catch {
      toast.error('Failed to create expense payment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-2 max-w-full mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loggedInUserRole === 'ROLE_GUEST' ? (
          <CounterCard
            title="My Income"
            value={paymentData.userTotalIncome}
            color="blue"
            icon={<MdMoney />}
          />
        ) : (
          <>
            <CounterCard
              title="Total Income"
              value={paymentData.totalIncome}
              color="green"
              icon={<CreditCardIcon />}
            />
            <CounterCard
              title="Total Expense"
              value={paymentData.totalExpense}
              color="red"
              icon={<CurrencyDollarIcon />}
            />
            <CounterCard
              title="My Income"
              value={paymentData.userTotalIncome}
              color="blue"
              icon={<MdMoney />}
            />
            <CounterCard
              title="My Expense"
              value={paymentData.userTotalExpense}
              color="orange"
              icon={<Md18UpRating />}
            />
          </>
        )}
      </div>

      {loggedInUserRole !== 'ROLE_GUEST' && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setModalType('income')}
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            + Add Income
          </button>
          <button
            onClick={() => setModalType('expense')}
            disabled={isLoading}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
          >
            + Add Expense
          </button>
        </div>
      )}

      <PaymentSummaryTable
        payments={paymentSummary}
        isLoading={isLoadingSummary}
      />

      {isLoading && (
        <div className="text-center text-gray-600 py-4">Loading...</div>
      )}

      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
              disabled={isLoading}
              aria-label="Close"
            >
              ×
            </button>

            <h3 className="text-lg font-semibold mb-4">
              {modalType === 'income' ? 'Add Income' : 'Add Expense'}
            </h3>

            {isLoading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : modalType === 'income' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={incomeForm.amount}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={incomeForm.description}
                    onChange={handleChange}
                    maxLength={255}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Users <span className="text-red-500">*</span>
                  </label>
                  {activeUsers.length > 0 ? (
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded p-2 space-y-2 bg-gray-50">
                      {activeUsers.map(user => {
                        const fullName = `${user.firstName} ${user.lastName}`;
                        const subtitle = user.designation?.trim() || user.role || 'No role';
                        const isSelected = incomeForm.userIds.includes(user.id);
                        const splitAmount =
                          incomeForm.amount && incomeForm.userIds.length
                            ? (parseFloat(incomeForm.amount) / incomeForm.userIds.length).toFixed(2)
                            : null;
                        return (
                          <label
                            key={user.id}
                            className="flex items-start gap-2 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleUserToggle(user.id)}
                              className="mt-0.5 accent-green-600"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{fullName}</p>
                              <p className="text-xs text-gray-600">{subtitle}</p>
                              {isSelected && splitAmount && (
                                <p className="text-xs text-green-600 font-medium">
                                  ${splitAmount} assigned
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No active users available.</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                  >
                    Submit
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Task (optional)</label>
                  <button
                    type="button"
                    onClick={() => setShowUserList(prev => !prev)}
                    className="text-xs bg-gray-200 px-2 py-1 rounded border hover:bg-gray-300 mb-2"
                  >
                    {showUserList ? '− Hide Tasks' : '+ Show Tasks'}
                  </button>
                  {showUserList && (
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded p-2 bg-gray-50">
                      {myTasks.length > 0 ? (
                        <div className="space-y-2">
                          {myTasks.map(task => {
                            const isSelected = parseInt(expenseForm.taskId) === task.id;
                            return (
                              <div
                                key={task.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setExpenseForm(prev => ({
                                      ...prev,
                                      taskId: '',
                                      amount: ''
                                    }));
                                  } else {
                                    setExpenseForm(prev => ({
                                      ...prev,
                                      taskId: task.id.toString(),
                                      amount: task.paymentAmount || ''
                                    }));
                                  }
                                }}
                                className={`cursor-pointer border rounded p-2 text-xs transition ${isSelected ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-red-300'}`}
                              >
                                <h4 className="font-medium truncate">{task.title || 'Untitled'}</h4>
                                <p className="text-gray-600 truncate">
                                  {task.status || 'No status'}
                                </p>
                                {task.paymentAmount && (
                                  <p className="text-green-600 font-medium">
                                    Amount: ${task.paymentAmount}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-gray-600 text-sm">No tasks available.</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={expenseForm.amount}
                    onChange={handleExpenseChange}
                    min="0.01"
                    step="0.01"
                    required
                    readOnly={expenseForm.taskId !== ''}
                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${expenseForm.taskId !== '' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  {expenseForm.taskId !== '' && (
                    <p className="text-xs text-gray-600 mt-1">Amount is set from selected task</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={expenseForm.description}
                    onChange={handleExpenseChange}
                    maxLength={255}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Files <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleExpenseFileChange}
                    required
                    className="w-full text-sm text-gray-700"
                  />
                  {expenseFiles.length > 0 && (
                    <div className="border rounded p-2 mt-2 bg-gray-50">
                      <div className="font-medium text-gray-700 text-xs mb-2">Uploaded Files:</div>
                      {expenseFiles.map((file, idx) => {
                        let fileUrl;
                        if (file.type?.startsWith('image/') || file.type === 'application/pdf') {
                          fileUrl = URL.createObjectURL(file);
                        }
                        return (
                          <div key={idx} className="flex items-center gap-2 mb-2">
                            {file.type?.startsWith('image/') && (
                              <img src={fileUrl} alt={file.name} className="h-8 w-8 rounded border object-cover" />
                            )}
                            {file.type === 'application/pdf' && (
                              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 2a2 2 0 00-2 2v16c0 1.103.897 2 2 2h12a2 2 0 002-2V8.414A1.997 1.997 0 0019.414 7L15 2.586A1.994 1.994 0 0013.586 2H6zm7 1.414L18.586 9H15a2 2 0 01-2-2V3.414zM6 4h7v3a4 4 0 004 4h3v11c0 .552-.447 1-1 1H6c-.553 0-1-.448-1-1V4zm5 10v4h2v-4h-2zm0-2h2c.553 0 1 .447 1 1v6c0 .553-.447 1-1 1h-2c-.553 0-1-.447-1-1v-6c0-.553.447-1 1-1z" />
                              </svg>
                            )}
                            <span className="text-xs truncate flex-1">{file.name}</span>
                            {fileUrl && (
                              <a
                                href={fileUrl}
                                download={file.name}
                                className="px-2 py-1 text-blue-700 border border-blue-300 rounded text-xs hover:bg-blue-50 transition"
                              >
                                Download
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};