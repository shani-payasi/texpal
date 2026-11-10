import React, { useState, useEffect } from 'react';
import ReportGenerator from '../components/reports/ReportGenerator';
import ReportList from '../components/reports/ReportList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { reportService } from '../services/reportService';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportService.getAll();
      setReports(res.reports || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch reports archive');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async (formData) => {
    try {
      setGenerating(true);
      toast.loading('Compiling statement & generating document...', { id: 'rep-gen' });
      const res = await reportService.generate(formData);
      toast.success('Report successfully compiled and ready!', { id: 'rep-gen' });

      // Refresh list
      await fetchReports();

      // Trigger instant download
      if (res.report?._id) {
        window.open(reportService.getDownloadUrl(res.report._id), '_blank');
      }
    } catch (err) {
      toast.error('Failed to generate report. Please try again.', { id: 'rep-gen' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Financial Statements & Report Generation
        </h2>
        <p className="text-xs text-slate-500">
          Generate formal PDF income statements and transaction CSV spreadsheets for tax preparation
        </p>
      </div>

      {/* Report Generator Form */}
      <ReportGenerator onGenerate={handleGenerateReport} loading={generating} />

      {/* Reports List */}
      {loading ? (
        <LoadingSpinner text="Retrieving archived reports..." />
      ) : (
        <ReportList reports={reports} />
      )}
    </div>
  );
};

export default Reports;

