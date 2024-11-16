import { useState } from 'react';
import { UserInfo } from '../types';
import { Stethoscope } from 'lucide-react';

interface Props {
  onSubmit: (userInfo: UserInfo) => void;
}

function InitialAssessment({ onSubmit }: Props) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    age: 0,
    gender: '',
    primaryIssue: ''
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(userInfo);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2">
        <Stethoscope className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold">Initial Assessment</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Age</label>
          <input
            type="number"
            required
            min="0"
            max="120"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={userInfo.age || ''}
            onChange={(e) => setUserInfo({ ...userInfo, age: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Gender</label>
          <select
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={userInfo.gender}
            onChange={(e) => setUserInfo({ ...userInfo, gender: e.target.value })}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">What's your main health concern?</label>
          <textarea
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            value={userInfo.primaryIssue}
            onChange={(e) => setUserInfo({ ...userInfo, primaryIssue: e.target.value })}
            placeholder="Describe your main symptoms or health concern..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          Continue
        </button>
      </form>
    </div>
  );
}

export default InitialAssessment; 