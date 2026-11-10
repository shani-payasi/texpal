import React from 'react';
import { Download, FileText, FileSpreadsheet, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelpers';
import { useAuth } from '../../context/AuthContext';
import { reportService } from '../../services/reportService';
import Button from '../common/Button';

const ReportList = ({ reports = [], onPreview }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 text-slate-400 text-xs">
        No generated reports yet. Select your criteria above to export your first financial statement.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800">Generated Reports Archive</h3>
        <p className="text-xs text-slate-400">Past generated statements available for instant download</p>
      </div>

      <div className="divide-y divide-slate-100">
        {reports.map((rep) => {
          const isPDF = rep.format === 'pdf';
          const income = rep.summaryData?.totalIncome || 0;
          const expense = rep.summaryData?.totalExpense || 0;

          return (
            <div
              key={rep._id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 ${
                    isPDF ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {isPDF ? (
                    <FileText className="w-5 h-5" />
                  ) : (
                    <FileSpreadsheet className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800">{rep.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(rep.createdAt)}
                    </span>
                    <span>•</span>
                    <span className="uppercase font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {rep.format}
                    </span>
                    {rep.summaryData && (
                      <>
                        <span>•</span>
                        <span>
                          Income: <strong className="text-emerald-600">{formatCurrency(income, currency)}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Expenses: <strong className="text-rose-600">{formatCurrency(expense, currency)}</strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <a
                  href={reportService.getDownloadUrl(rep._id)}
                  download={rep.fileName}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportList;

