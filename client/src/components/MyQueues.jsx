import React from 'react';
import { Clock, Bell, Calendar, Users } from 'lucide-react';

function MyQueues() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 text-center">
          <h1 className="text-2xl font-bold">My Queues</h1>
          <p className="text-indigo-100 mt-2">Manage all your queues in one place</p>
        </div>
        
        {/* Coming Soon Content */}
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-indigo-100 flex items-center justify-center">
                <Clock size={64} className="text-indigo-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <Bell size={20} className="text-yellow-800" />
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Coming Soon!</h2>
          <p className="text-center text-gray-600 mb-8">
            We're working hard to bring you the best queue management experience. Stay tuned for updates!
          </p>
          
          {/* Feature Preview */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Features to look forward to:</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                  <Users size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Manage Multiple Queues</h4>
                  <p className="text-sm text-gray-600">Control all your queues from a single dashboard</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                  <Bell size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Real-time Notifications</h4>
                  <p className="text-sm text-gray-600">Get alerts when people join or leave your queues</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                  <Calendar size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Queue Analytics</h4>
                  <p className="text-sm text-gray-600">Track wait times and queue performance</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Email Notification */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center">
            <p className="text-sm text-indigo-800">
              Want to be notified when this feature launches? Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <p className="text-sm text-gray-500 mt-8">© 2025 Queue App. All rights reserved.</p>
    </div>
  );
}

export default MyQueues;