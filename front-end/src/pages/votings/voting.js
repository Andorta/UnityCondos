import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { castVote, closePoll, createPoll, deletePoll, getAllPolls, updatePoll } from '../../servicecall/api';

export const Voting = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPollId, setEditingPollId] = useState(null);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [votingLoading, setVotingLoading] = useState({});
  const [selectedOptionForVoters, setSelectedOptionForVoters] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    setIsAdmin(userData?.role === 'ROLE_ADMIN');
    fetchPolls();
  }, []);

  useEffect(() => {
    const newSelectedOptions = {};
    polls.forEach(poll => {
      if (poll.selectedOption) {
        const selectedIndex = poll.options.findIndex(option => option === poll.selectedOption);
        if (selectedIndex !== -1) {
          newSelectedOptions[poll.pollId] = selectedIndex;
        }
      }
    });
    setSelectedOptions(newSelectedOptions);
  }, [polls]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const pollsData = await getAllPolls();
      setPolls(pollsData);
    } catch (error) {
      toast.error('Failed to fetch polls');
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const updatedOptions = [...options];
      updatedOptions.splice(index, 1);
      setOptions(updatedOptions);
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const validate = () => {
    if (!question.trim()) {
      toast.error('Question is required');
      return false;
    }
    if (question.length > 200) {
      toast.error('Question must not exceed 200 characters');
      return false;
    }
    if (options.length < 2) {
      toast.error('At least 2 options are required');
      return false;
    }
    for (let option of options) {
      if (!option.trim()) {
        toast.error('All options must be filled');
        return false;
      }
    }
    return true;
  };

  const handlePublish = async () => {
    if (!validate()) return;

    const payload = {
      question,
      options,
    };

    try {
      let newPoll;
      if (isEditMode) {
        newPoll = await updatePoll(editingPollId, payload);
        toast.success('Poll updated successfully!');
      } else {
        newPoll = await createPoll(payload);
        toast.success('Poll created successfully!');
      }

      resetModal();
      fetchPolls(); // Fetch latest data instead of local state update
    } catch (error) {
      toast.error(error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} poll`);
    }
  };

  const resetModal = () => {
    setQuestion('');
    setOptions(['', '']);
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingPollId(null);
  };

  const handleEdit = (poll) => {
    setIsEditMode(true);
    setEditingPollId(poll.pollId);
    setQuestion(poll.question);
    setOptions([...poll.options]);
    setIsModalOpen(true);
  };

  const handleDelete = async (pollId) => {
    if (window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      try {
        const response = await deletePoll(pollId);
        if (response) {
          toast.success('Poll deleted successfully!');
          fetchPolls(); // Fetch latest data instead of local state update
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to delete poll');
      }
    }
  };

  const handleFinishVoting = async (pollId) => {
    if (window.confirm('Are you sure you want to finish voting for this poll? This action cannot be undone.')) {
      try {
        await closePoll(pollId);
        toast.success('Voting finished successfully!');
        fetchPolls(); // Fetch latest data instead of local state update
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to finish voting');
      }
    }
  };

  const handleOptionSelect = async (pollId, optionIndex) => {
    const poll = polls.find(p => p.pollId === pollId);

    if (!poll.isActive && !isAdmin) {
      toast.error('Voting has ended for this poll');
      return;
    }

    if (isAdmin) {
      const key = `${pollId}-${optionIndex}`;
      setSelectedOptionForVoters(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
      return;
    }

    if (!poll) {
      toast.error('Poll not found');
      return;
    }

    const selectedOption = poll.options[optionIndex];
    if (!selectedOption) {
      toast.error('Invalid option selected');
      return;
    }

    setVotingLoading(prev => ({
      ...prev,
      [pollId]: true
    }));

    try {
      const votePayload = {
        pollId: pollId,
        selectedOption: selectedOption
      };
      await castVote(votePayload);

      toast.success('Vote submitted successfully!');

      // Fetch latest data instead of updating local state
      fetchPolls();

    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit vote');
      console.error('Error submitting vote:', error);
    } finally {
      setVotingLoading(prev => ({
        ...prev,
        [pollId]: false
      }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { dateStr, timeStr };
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.trim()?.[0] || 'A';
    const last = lastName?.trim()?.[0] || '';
    return (first + last).toUpperCase();
  };

  const getOptionResult = (poll, optionIndex) => {
    if (poll.optionResults && poll.optionResults[optionIndex]) {
      return poll.optionResults[optionIndex];
    }
    return { voteCount: 0, percentage: 0, voters: [] };
  };

  const getAvatarStyle = (index) => {
    const styles = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600',
      'from-orange-500 to-orange-600',
      'from-cyan-500 to-cyan-600'
    ];
    return styles[index % styles.length];
  };

  const renderAdminOptions = (poll) => {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {poll.options.map((option, index) => {
            const optionResult = getOptionResult(poll, index);
            const percentage = optionResult.percentage || 0;
            const voteCount = optionResult.voteCount || 0;
            const key = `${poll.pollId}-${index}`;
            const showVoters = selectedOptionForVoters[key];

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOptionSelect(poll.pollId, index)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm border border-gray-200 transition-all duration-300 hover:shadow-md relative overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 bg-blue-200 transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                    <div className="relative flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full border ${percentage > 0 ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}></div>
                      <span className="font-medium text-gray-900">{option}</span>
                    </div>
                  </button>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700 font-medium">
                    {percentage}% ({voteCount})
                  </span>
                </div>
                {showVoters && optionResult.voters && optionResult.voters.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {optionResult.voters.slice(0, 30).map((voter, voterIndex) => (
                      <div
                        key={voterIndex}
                        className="relative group"
                      >
                        <div className={`w-8 h-8 bg-gradient-to-br ${getAvatarStyle(voterIndex)} rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer`}>
                          {getInitials(voter.firstName, voter.lastName)}
                        </div>
                        <div className="absolute bottom-full left-0 transform translate-x-1 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                          {voter.firstName} {voter.lastName}
                          <div className="text-gray-300">{voter.email}</div>
                        </div>
                      </div>
                    ))}
                    {optionResult.voters.length > 30 && (
                      <div className="relative group">
                        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-xs font-semibold text-white cursor-pointer hover:bg-gray-600 transition-colors">
                          +{optionResult.voters.length - 30}
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 max-w-xs">
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {optionResult.voters.slice(30).map((voter, idx) => (
                              <div key={idx} className="whitespace-nowrap">
                                {voter.firstName} {voter.lastName} ({voter.email})
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderUserOptions = (poll) => {
    const isVotingOnThisPoll = votingLoading[poll.pollId];
    const isPollInactive = !poll.isActive;

    return (
      <div className="flex flex-wrap gap-2">
        {poll.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(poll.pollId, index)}
            disabled={isVotingOnThisPoll || isPollInactive}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition-colors ${isPollInactive
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : selectedOptions[poll.pollId] === index
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              } ${isVotingOnThisPoll ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className={`w-3 h-3 rounded-full border ${isPollInactive
              ? 'border-gray-300'
              : selectedOptions[poll.pollId] === index
                ? 'bg-blue-600 border-blue-600'
                : 'border-gray-300'
              }`}>
              {isVotingOnThisPoll && selectedOptions[poll.pollId] === index && (
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            {option}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-end mb-6">
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg shadow-sm transition-colors duration-200 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Poll
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No polls available</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new poll.</p>
          </div>
        ) : (
          polls.map((poll) => {
            const { dateStr, timeStr } = poll.createdAt ? formatDate(poll.createdAt) : { dateStr: '', timeStr: '' };

            return (
              <div key={poll.pollId} className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${!poll.isActive ? 'opacity-75' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{poll.question}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && poll.voteCount === 0 && poll.isActive && (
                      <>
                        <button
                          onClick={() => handleEdit(poll)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                          title="Edit poll"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(poll.pollId)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="Delete poll"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                    {isAdmin && poll.voteCount > 0 && poll.isActive && (
                      <button
                        onClick={() => handleFinishVoting(poll.pollId)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors duration-200"
                        title="Finish voting for this poll"
                      >
                        Finish Voting
                      </button>
                    )}
                    {!poll.isActive && (
                      <span className="inline-block text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                        Voting Ended
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  {isAdmin ? renderAdminOptions(poll) : renderUserOptions(poll)}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Total Votes: {poll.voteCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {getInitials(poll.userResponseDto?.firstName, poll.userResponseDto?.lastName)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-start text-gray-700">
                          {poll.userResponseDto?.firstName || 'Admin'} {poll.userResponseDto?.lastName || ''}
                        </div>
                        <div className="text-xs text-start text-gray-500">
                          {poll.userResponseDto?.email || 'admin@company.com'}
                        </div>
                      </div>
                    </div>
                    {poll.createdAt && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-start text-gray-700">
                            {dateStr}
                          </div>
                          <div className="text-xs text-start text-gray-500">
                            {timeStr}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-2 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditMode ? 'Edit Poll' : 'Create New Poll'}
              </h2>
              <button
                onClick={resetModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poll Question
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                  placeholder="What would you like to ask?"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {question.length}/200 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Answer Options
                </label>
                <div className="space-y-3">
                  {options.map((opt, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                      </div>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder={`Option ${index + 1}`}
                      />
                      {options.length > 2 && (
                        <button
                          onClick={() => handleRemoveOption(index)}
                          className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors p-1"
                          title="Remove option"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {options.length < 10 && (
                  <button
                    onClick={handleAddOption}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mt-3 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Option
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-2 border-t border-gray-200 bg-gray-50">
              <button
                onClick={resetModal}
                className="text-sm px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="text-sm px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-sm"
              >
                {isEditMode ? 'Update Poll' : 'Publish Poll'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};