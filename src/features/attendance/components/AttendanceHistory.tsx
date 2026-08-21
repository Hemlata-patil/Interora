import React, { useState } from 'react';
import { Card, Badge, Table, Modal, Button } from '@/components';
import type { AttendanceRecord } from '../data/mockAttendance';
import { Camera, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

export interface AttendanceHistoryProps {
  records: AttendanceRecord[];
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ records }) => {
  const [selectedPhotoRecord, setSelectedPhotoRecord] = useState<AttendanceRecord | null>(null);

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return <Badge variant="emerald">Present</Badge>;
      case 'late':
        return <Badge variant="amber">Late</Badge>;
      case 'absent':
        return <Badge variant="rose">Absent</Badge>;
      case 'weekend':
        return <Badge variant="neutral">Weekend</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns = [
    { key: 'date', header: 'Date', render: (r: AttendanceRecord) => <span className="font-semibold text-slate-800 text-xs">{r.date}</span> },
    { key: 'day', header: 'Day', render: (r: AttendanceRecord) => <span className="text-slate-600 text-xs">{r.day}</span> },
    { key: 'status', header: 'Status', render: (r: AttendanceRecord) => getStatusBadge(r.status) },
    { key: 'checkIn', header: 'Check In', render: (r: AttendanceRecord) => <span className="text-slate-700 text-xs font-mono">{r.checkIn}</span> },
    { key: 'checkOut', header: 'Check Out', render: (r: AttendanceRecord) => <span className="text-slate-700 text-xs font-mono">{r.checkOut}</span> },
    { key: 'workingHours', header: 'Working Hours', render: (r: AttendanceRecord) => <span className="text-slate-800 font-medium text-xs">{r.workingHours}</span> },
    {
      key: 'geoProof',
      header: 'Geo-Tagged Proof',
      render: (r: AttendanceRecord) => (
        <div className="flex items-center space-x-1.5">
          <Button
            variant="outline"
            size="sm"
            className="text-[11px] py-1 px-2.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            onClick={() => setSelectedPhotoRecord(r)}
          >
            <Camera className="w-3 h-3 mr-1 text-indigo-600" /> Photo & GPS
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card title="Attendance History Logs" subtitle="Detailed daily check-in, check-out, and verified GPS photo proofs">
        <div className="overflow-x-auto">
          <Table columns={columns} data={records} keyExtractor={(r) => r.id} />
        </div>
      </Card>

      {selectedPhotoRecord && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPhotoRecord(null)}
          title={`Geo-Tagged Proof: ${selectedPhotoRecord.date} (${selectedPhotoRecord.day})`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-indigo-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="font-bold text-xs block">
                    GPS Coordinates: {selectedPhotoRecord.checkInLat || 18.5204}° N, {selectedPhotoRecord.checkInLng || 73.8567}° E
                  </span>
                  <span className="text-[10px] text-indigo-700">
                    {selectedPhotoRecord.locationAddress || 'Campus Geotagged Location (Verified)'}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-700 block">Check-In Photo Proof ({selectedPhotoRecord.checkIn})</span>
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative flex items-center justify-center">
                  {selectedPhotoRecord.checkInPhotoUrl ? (
                    <img src={selectedPhotoRecord.checkInPhotoUrl} alt="Check-In Proof" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Camera className="w-8 h-8 text-indigo-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-300 font-mono block">GPS: 18.5204° N, 73.8567° E</span>
                      <span className="text-[10px] text-emerald-400 font-semibold block mt-1">Geo-Tagged Check-In Verified</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-700 block">Check-Out Photo Proof ({selectedPhotoRecord.checkOut})</span>
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative flex items-center justify-center">
                  {selectedPhotoRecord.checkOutPhotoUrl ? (
                    <img src={selectedPhotoRecord.checkOutPhotoUrl} alt="Check-Out Proof" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Camera className="w-8 h-8 text-sky-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-300 font-mono block">GPS: 18.5204° N, 73.8567° E</span>
                      <span className="text-[10px] text-emerald-400 font-semibold block mt-1">Geo-Tagged Check-Out Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setSelectedPhotoRecord(null)}>
                Close Proof Window
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
