import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

interface KeystoreUploadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, password: string) => void;
}

const KeystoreUploadPopup: React.FC<KeystoreUploadPopupProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidFile = (fileName: string): boolean => {
    return fileName.endsWith('.json') || 
           fileName.endsWith('.txt') || 
           fileName.endsWith('.keystore');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      if (isValidFile(selectedFile.name)) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a valid keystore file (.json, .txt or .keystore)');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a keystore file');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    const fileToUpload = file
    const passwordToUpload = password
    setFile(null)
    setPassword('')
    onUpload(fileToUpload, passwordToUpload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setFile(null)
        setPassword('')
        onClose()
      }}
      title="Upload Keystore File"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json,.txt,.keystore"
            onChange={handleFileSelect}
          />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Click to select your keystore file
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: .json, .txt, .keystore
          </p>
        </div>

        {file && (
          <p className="text-sm text-gray-600">
            Selected file: {file.name}
          </p>
        )}

        <Input
          type="password"
          label="Password"
          placeholder="Enter your keystore password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Connect Wallet
        </button>
      </form>
    </Modal>
  );
};

export default KeystoreUploadPopup; 