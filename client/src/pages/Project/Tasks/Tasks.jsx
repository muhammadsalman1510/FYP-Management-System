import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const Tasks = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'submitted'
  
  // Sample data - in real app, this would come from backend
  const pendingTasks = [
    {
      id: 1,
      title: 'Assignment 1',
      totalMarks: 10,
      obtainedMarks: '',
      openDate: '02-11-2025',
      dueDate: '13-11-2025',
      status: 'pending',
      assignedBy: 'Mr. Shoaib (Supervisor)',
      description: 'Complete the initial project proposal documentation',
      attachedFile: 'assignment1_guidelines.pdf'
    },
    {
      id: 2,
      title: '2nd assignment',
      totalMarks: 10,
      obtainedMarks: '',
      openDate: '02-11-2025',
      dueDate: '13-11-2025',
      status: 'pending',
      assignedBy: 'Mr. Omer (Coordinator)',
      description: 'Literature review and research methodology',
      attachedFile: 'literature_review_requirements.pdf'
    }
  ];

  const submittedTasks = [
    {
      id: 3,
      title: 'Project Proposal Draft',
      totalMarks: 15,
      obtainedMarks: '12',
      openDate: '02-11-2025',
      dueDate: '13-11-2025',
      submitDate: '04-11-2025',
      status: 'submitted',
      assignedBy: 'Mr. Shoaib (Supervisor)',
      submittedFile: 'project_proposal_draft.pdf',
      feedback: 'Good work, but need more technical details'
    },
    {
      id: 4,
      title: 'Research Methodology',
      totalMarks: 10,
      obtainedMarks: 'Pending',
      openDate: '02-11-2025',
      dueDate: '13-11-2025',
      submitDate: '11-11-2025',
      status: 'submitted',
      assignedBy: 'Mr. Omer (Coordinator)',
      submittedFile: 'research_methodology.docx',
      feedback: 'Under review'
    }
  ];

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    totalMarks: '',
    dueDate: '',
    file: null
  });

  const [uploadFile, setUploadFile] = useState(null);

  const handleSubmitTask = (taskId) => {
    // In real app, this would upload the file to backend
    if (uploadFile) {
      alert(`Task ${taskId} submitted successfully with file: ${uploadFile.name}`);
      setUploadFile(null);
    } else {
      alert('Please select a file to submit');
    }
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    // In real app, this would send data to backend
    alert('New task created successfully!');
    setNewTask({
      title: '',
      description: '',
      totalMarks: '',
      dueDate: '',
      file: null
    });
  };

  return (
    <>
      <Breadcrumb pageName="Tasks" />

      <div className="grid grid-cols-1 gap-9">
        {/* Task Creation Form (for Supervisor/Coordinator) */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Create New Task
            </h3>
          </div>
          <form onSubmit={handleCreateTask} className="p-6.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Total Marks *
                </label>
                <input
                  type="number"
                  value={newTask.totalMarks}
                  onChange={(e) => setNewTask({...newTask, totalMarks: e.target.value})}
                  placeholder="Enter total marks"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="mb-4.5 mt-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                rows={3}
                placeholder="Enter task description and requirements..."
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Attach File (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewTask({...newTask, file: e.target.files[0]})}
                  className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90 mt-6"
            >
              Create Task
            </button>
          </form>
        </div>

        {/* Tasks Navigation Tabs */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke dark:border-strokedark">
            <div className="flex">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === 'pending'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-bodydark2 hover:text-black dark:hover:text-white'
                }`}
              >
                Pending Tasks
              </button>
              <button
                onClick={() => setActiveTab('submitted')}
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === 'submitted'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-bodydark2 hover:text-black dark:hover:text-white'
                }`}
              >
                Submitted Tasks
              </button>
            </div>
          </div>

          <div className="p-6.5">
            {/* Pending Tasks Table */}
            {activeTab === 'pending' && (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Sr. #</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Title</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Total Marks</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Obtained Marks</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Open Date</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Due Date</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTasks.map((task, index) => (
                      <tr key={task.id} className="border-b border-stroke dark:border-strokedark">
                        <td className="py-5 px-4">{index + 1}</td>
                        <td className="py-5 px-4">
                          <div>
                            <p className="font-medium text-black dark:text-white">{task.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">By: {task.assignedBy}</p>
                            {task.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
                            )}
                            {task.attachedFile && (
                              <p className="text-sm text-primary mt-1">📎 {task.attachedFile}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-4">{task.totalMarks}</td>
                        <td className="py-5 px-4">
                          <span className="text-yellow-600 dark:text-yellow-400">-</span>
                        </td>
                        <td className="py-5 px-4">{task.openDate}</td>
                        <td className="py-5 px-4">
                          <span className={`${new Date(task.dueDate) < new Date() ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white'}`}>
                            {task.dueDate}
                          </span>
                        </td>
                        <td className="py-5 px-4">
                          <div className="flex items-center space-x-3">
                            <input
                              type="file"
                              onChange={(e) => setUploadFile(e.target.files[0])}
                              className="hidden"
                              id={`file-upload-${task.id}`}
                            />
                            <label
                              htmlFor={`file-upload-${task.id}`}
                              className="cursor-pointer bg-primary text-white py-2 px-4 rounded hover:bg-opacity-90 transition"
                            >
                              Upload File
                            </label>
                            {uploadFile && (
                              <button
                                onClick={() => handleSubmitTask(task.id)}
                                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                              >
                                Submit
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Submitted Tasks Table */}
            {activeTab === 'submitted' && (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Open Date</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Due Date</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Submit Date</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Submit</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submittedTasks.map((task) => (
                      <tr key={task.id} className="border-b border-stroke dark:border-strokedark">
                        <td className="py-5 px-4">{task.openDate}</td>
                        <td className="py-5 px-4">{task.dueDate}</td>
                        <td className="py-5 px-4">{task.submitDate}</td>
                        <td className="py-5 px-4">
                          <button className="text-primary hover:underline font-medium">
                            Download
                          </button>
                          {task.submittedFile && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {task.submittedFile}
                            </p>
                          )}
                        </td>
                        <td className="py-5 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              ✅ Submitted
                            </span>
                            {task.obtainedMarks && (
                              <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-sm">
                                Marks: {task.obtainedMarks}/{task.totalMarks}
                              </span>
                            )}
                          </div>
                          {task.feedback && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Feedback: {task.feedback}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Tasks;