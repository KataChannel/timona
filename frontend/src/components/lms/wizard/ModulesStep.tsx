// ✅ MIGRATED TO DYNAMIC GRAPHQL - 2025-10-29
// Original backup: ModulesStep.tsx.backup

'use client';

import { useState } from 'react';
import { useFindUnique, useCreateOne, useUpdateOne, useDeleteOne } from '@/hooks/useDynamicGraphQL';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';

interface ModulesStepProps {
  courseId: string;
  onNext: () => void;
  onBack: () => void;
}

export default function ModulesStep({ courseId, onNext, onBack }: ModulesStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  // ✅ Migrated to Dynamic GraphQL
  const { data: course, loading, refetch } = useFindUnique('course', courseId, {
    include: { modules: { orderBy: { order: 'asc' } } },
  });

  const [createModule, { loading: creating }] = useCreateOne('module');
  const [updateModule, { loading: updating }] = useUpdateOne('module');
  const [deleteModule] = useDeleteOne('module');

  const modules = course?.modules || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingModule) {
      await updateModule({
        where: { id: editingModule.id },
        data: {
          title: formData.title,
          description: formData.description,
        },
      });
      setEditingModule(null);
      setFormData({ title: '', description: '' });
      refetch();
    } else {
      await createModule({
        data: {
          courseId,
          title: formData.title,
          description: formData.description,
        },
      });
      setShowForm(false);
      setFormData({ title: '', description: '' });
      refetch();
    }
  };

  const handleEdit = (module: any) => {
    setEditingModule(module);
    setFormData({ title: module.title, description: module.description || '' });
    setShowForm(true);
  };

  const handleDelete = async (moduleId: string) => {
    if (confirm('Are you sure you want to delete this module?')) {
      await deleteModule({ where: { id: moduleId } });
      refetch();
    }
  };

  const canProceed = modules.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Modules</h2>
        <p className="text-gray-600">Organize your course content into modules</p>
      </div>

      {/* Module List */}
      <div className="space-y-4">
        {modules.map((module: any, index: number) => (
          <div
            key={module.id}
            className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {index + 1}. {module.title}
                  </h3>
                </div>
                {module.description && (
                  <p className="text-gray-600 ml-8">{module.description}</p>
                )}
                <p className="text-sm text-gray-500 ml-8 mt-2">
                  {module.lessons?.length || 0} lessons
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(module)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(module.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Module Form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {editingModule ? 'Edit Module' : 'Add New Module'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Getting Started with React"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this module..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating || updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {creating || updating ? 'Saving...' : editingModule ? 'Update Module' : 'Add Module'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingModule(null);
                  setFormData({ title: '', description: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Module
        </button>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Add Lessons
        </button>
      </div>

      {!canProceed && (
        <p className="text-sm text-amber-600 text-center">
          Please add at least one module to continue
        </p>
      )}
    </div>
  );
}
