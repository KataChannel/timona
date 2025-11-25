'use client';

import { useState } from 'react';
import { Upload, FileText, Trash2, Download, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { TrainingDataResponse, TrainingDataType, TrainingStatus, CreateTrainingDataDto } from '@/types/chatbot';
import { useTrainingData } from '@/hooks/useChatbot';

interface TrainingDataManagerProps {
  chatbotId: string;
  onBack: () => void;
}

export function TrainingDataManager({ chatbotId, onBack }: TrainingDataManagerProps) {
  const { 
    trainingData, 
    loading, 
    error, 
    createTrainingData, 
    deleteTrainingData 
  } = useTrainingData();
  
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Read file content
        const content = await readFileContent(file);
        
        await createTrainingData(chatbotId, {
          title: file.name,
          type: getFileType(file),
          content: content,
        });
      } catch (error) {
        setUploadError(`Failed to upload ${file.name}: ${error}`);
        break;
      }
    }

    setUploading(false);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const getFileType = (file: File): TrainingDataType => {
    if (file.type === 'text/plain') return TrainingDataType.TEXT;
    if (file.type === 'application/pdf') return TrainingDataType.DOCUMENT;
    if (file.type === 'text/csv') return TrainingDataType.KNOWLEDGE_BASE;
    if (file.type === 'application/json') return TrainingDataType.KNOWLEDGE_BASE;
    return TrainingDataType.TEXT; // default
  };

  const getStatusColor = (status: TrainingStatus) => {
    switch (status) {
      case TrainingStatus.PENDING: return 'text-yellow-600 bg-yellow-100';
      case TrainingStatus.PROCESSING: return 'text-blue-600 bg-blue-100';
      case TrainingStatus.COMPLETED: return 'text-green-600 bg-green-100';
      case TrainingStatus.FAILED: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: TrainingStatus) => {
    switch (status) {
      case TrainingStatus.PENDING: return Clock;
      case TrainingStatus.PROCESSING: return Clock;
      case TrainingStatus.COMPLETED: return CheckCircle;
      case TrainingStatus.FAILED: return AlertCircle;
      default: return FileText;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors mb-2"
            >
              ← Back to Chatbots
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Training Data</h1>
            <p className="text-gray-600">Upload and manage training data for your chatbot</p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="p-6 border-b border-gray-200">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".txt,.pdf,.csv,.json"
            disabled={uploading}
          />
          
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload Training Data
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-sm text-gray-500">
            Supported formats: TXT, PDF, CSV, JSON (Max 10MB per file)
          </p>
          
          {uploading && (
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </div>
            </div>
          )}
          
          {uploadError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{uploadError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Training Data List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        ) : trainingData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No training data</h3>
              <p className="text-gray-500">Upload some files to start training your chatbot</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {trainingData.map((data) => {
                const StatusIcon = getStatusIcon(data.status);
                
                return (
                  <div
                    key={data.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {data.title}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
                              <StatusIcon className="h-3 w-3" />
                              {data.status}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {data.filePath ? `File: ${data.filePath}` : 'Text content'}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Type: {data.type}</span>
                            <span>Content: {data.content ? `${data.content.length} chars` : 'No content'}</span>
                            <span>Created: {formatDate(data.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {data.status === TrainingStatus.PENDING && (
                          <button
                            onClick={() => {
                              // Process training data - you can implement this later
                              console.log('Process training data:', data.id);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Process data"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteTrainingData(data.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
