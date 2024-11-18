import { useState } from 'react';
import { Stethoscope, Loader } from 'lucide-react';
import { UserInfo } from '../types';

interface Props {
  onSubmit: (userInfo: UserInfo) => void;
  loading: boolean;
}

function AssessmentForm({ onSubmit, loading }: Props) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    age: 0,
    ageUnit: 'years',
    gender: '',
    primaryIssue: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(userInfo);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
          <Stethoscope className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
        <p className="mt-2 text-gray-600">Help us understand your condition better</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Age Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Age</label>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <input
                type="number"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={userInfo.age || ''}
                onChange={(e) => {
                  const age = parseInt(e.target.value) || 0;
                  setUserInfo({ 
                    ...userInfo, 
                    age,
                    ageUnit: age <= 4 ? 'months' : 'years'
                  });
                }}
                min="0"
                required
              />
            </div>
            <select
              value={userInfo.ageUnit}
              onChange={(e) => setUserInfo({ ...userInfo, ageUnit: e.target.value as 'years' | 'months' })}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="years">Years</option>
              <option value="months">Months</option>
            </select>
          </div>
        </div>

        {/* Gender Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Gender</label>
          <div className="grid grid-cols-3 gap-4">
            {['Male', 'Female', 'Other'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setUserInfo({ ...userInfo, gender: option })}
                className={`
                  px-4 py-3 rounded-lg border text-sm font-medium capitalize
                  ${userInfo.gender === option 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Symptom Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            What's bothering you?
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
            value={userInfo.primaryIssue}
            onChange={(e) => setUserInfo({ ...userInfo, primaryIssue: e.target.value })}
            placeholder="Enter your main symptom (e.g., headache, fever, cough)"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !userInfo.gender || userInfo.age === 0 || !userInfo.primaryIssue}
          className={`
            w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg
            text-base font-semibold transition-all duration-200
            ${loading || !userInfo.gender || userInfo.age === 0 || !userInfo.primaryIssue
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
            }
          `}
        >
          {loading ? (
            <>
              <Loader className="animate-spin h-5 w-5" />
              Processing...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </form>
    </div>
  );
}

export default AssessmentForm; 