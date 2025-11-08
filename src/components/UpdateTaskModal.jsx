"use client";

import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { updateTask, fetchTasks } from "@/redux/slices/taskSlice";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";

export default function UpdateTaskModal({ show, close, task, teamMembers = [] }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.task);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: "",
    dueDate: ""
  });

  const [initialData, setInitialData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when task changes
  useEffect(() => {
    if (task && show) {
      const initialFormData = {
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        assignedTo: task.assignedTo?._id || "",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : ""
      };
      
      setFormData(initialFormData);
      setInitialData(initialFormData);
      setHasChanges(false);
    }
  }, [task, show]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Check if there are any changes
    const newFormData = { ...formData, [field]: value };
    const changesExist = Object.keys(newFormData).some(key => 
      newFormData[key] !== initialData[key]
    );
    setHasChanges(changesExist);
  };

  const handleUpdate = () => {
    if (!formData.title || !formData.description || !formData.assignedTo || !formData.dueDate) {
      return alert("Please fill all required fields");
    }

    // Find only the fields that have changed
    const updates = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] !== initialData[key]) {
        updates[key] = formData[key];
      }
    });

    console.log("Changed fields:", updates);

    // If no changes were made, show message
    if (Object.keys(updates).length === 0) {
      alert("No changes made to the task");
      return;
    }

    dispatch(
      updateTask({
        taskId: task._id,
        updates: updates
      })
    )
      .unwrap()
      .then((result) => {
        console.log("Update successful:", result);
        dispatch(fetchTasks(task.team));
        close();
        alert("✅ Task Updated Successfully");
      })
      .catch((err) => {
        console.error("Update error:", err);
        alert(`Error: ${err}`);
      });
  };

  const handleClose = () => {
    // Reset form and close
    setHasChanges(false);
    close();
  };

  // Safe display functions to handle objects
  const displayValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === 'object') {
      return value.name || value._id || JSON.stringify(value);
    }
    return value;
  };

  const getCreatedByName = () => {
    if (!task.createdBy) return "Unknown";
    if (typeof task.createdBy === 'string') return task.createdBy;
    return task.createdBy.name || "Unknown";
  };

  if (!show || !task) return null;

  return (
    <Modal title="Update Task" close={handleClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            placeholder="Enter task title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            placeholder="Enter task description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="critical">Critical Priority</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To *
          </label>
          <select
            value={formData.assignedTo}
            onChange={(e) => handleChange("assignedTo", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required
          >
            <option value="">Select Team Member</option>
            {teamMembers.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date *
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        <Button 
          label={hasChanges ? "Update Task" : "No Changes Made"} 
          onClick={handleUpdate} 
          loading={loading}
          className="w-full"
          disabled={!hasChanges || loading}
        />

        {/* Debug info - shows what will be sent to API */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <p className="text-xs text-gray-600 font-mono">
            <strong>Debug Information:</strong><br/>
            <strong>Changes to be sent:</strong><br/>
            {Object.keys(formData).map(key => 
              formData[key] !== initialData[key] ? (
                <span key={key} className="text-green-600">
                  {key}: "{displayValue(initialData[key])}" → "{displayValue(formData[key])}"<br/>
                </span>
              ) : (
                <span key={key} className="text-gray-400">
                  {key}: "{displayValue(formData[key])}" (no change)<br/>
                </span>
              )
            )}
          </p>
        </div>

        {/* Current task info - FIXED: Safe object rendering */}
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>Current Task:</strong><br/>
            ID: {task._id}<br/>
            Team: {displayValue(task.team)}<br/>
            Created By: {getCreatedByName()}<br/>
            Assigned To: {displayValue(task.assignedTo)}
          </p>
        </div>
      </div>
    </Modal>
  );
}