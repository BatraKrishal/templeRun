import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, CheckCircle, Users, Download, Printer } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useVoice } from '../../context/VoiceContext';
import { FormFieldWithVoice } from '../../components/forms/FormFieldWithVoice';

export const ParivarRegisterPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { language } = useAccessibility();
  const { registerSlotListener, speakText } = useVoice();

  const [searchParams, setSearchParams] = useState({
    district: 'Pauri Garhwal',
    block: 'Duggada',
    gram_panchayat: 'Kandolia',
    head_name: '',
  });

  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const unsub = registerSlotListener((slots) => {
      setSearchParams((prev) => ({
        ...prev,
        ...slots,
        block: slots.block || slots.development_block || prev.block,
        head_name: slots.head_name || slots.head_of_family_name || prev.head_name,
      }));
    });

    return () => unsub();
  }, [registerSlotListener]);

  const familyMembers = [
    { serial: 1, name: 'कुलदीप सिंह नेगी (Kuldeep Singh Negi)', relation: 'मुखिया (Self)', age: 48, literacy: 'स्नातक (Graduate)', occ: 'कृषि / स्वरोजगार' },
    { serial: 2, name: 'मंजू देवी (Manju Devi)', relation: 'पत्नी (Wife)', age: 44, literacy: 'इंटरमीडिएट', occ: 'गृहिणी' },
    { serial: 3, name: 'अमन सिंह नेगी (Aman Singh Negi)', relation: 'पुत्र (Son)', age: 20, literacy: 'बी.टेक छात्र', occ: 'अध्ययनरत' },
    { serial: 4, name: 'प्रिया नेगी (Priya Negi)', relation: 'पुत्री (Daughter)', age: 17, literacy: 'कक्षा 12', occ: 'अध्ययनरत' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/all-services')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-navbar"
        >
          <ArrowLeft className="size-4" />
          <span>{language === 'hi' ? 'सेवाओं की सूची' : 'Back to Services'}</span>
        </button>
        <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-3 py-1 rounded-full border border-emerald-200">
          पंचायती राज विभाग &bull; परिवार रजिस्टर नकल &bull; Fee: ₹40
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900">
          {language === 'hi' ? 'परिवार रजिस्टर की नकल (Copy of Pariwar Register)' : 'Search & Extract Copy of Pariwar Register'}
        </h1>
        <p className="text-xs text-gray-600 mt-1">उत्तराखंड पंचायती राज अधिनियम के तहत ग्राम सभा कुटुंब रजिस्टर से प्रमाणित उद्धरण</p>
      </div>

      {/* Search Filter Box */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase text-navbar border-b pb-2 flex items-center gap-2">
          <Users className="size-4" />
          <span>ग्राम पंचायत एवं परिवार खोज (Search Parameters)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <FormFieldWithVoice
            id="district"
            label="District"
            labelHindi="जनपद"
            type="select"
            value={searchParams.district}
            onChange={(v) => setSearchParams((p) => ({ ...p, district: v }))}
            options={[
              { value: 'Pauri Garhwal', label: 'Pauri Garhwal' },
              { value: 'Dehradun', label: 'Dehradun' },
              { value: 'Haridwar', label: 'Haridwar' },
              { value: 'Tehri Garhwal', label: 'Tehri Garhwal' },
              { value: 'Almora', label: 'Almora' },
            ]}
          />
          <FormFieldWithVoice
            id="block"
            label="Development Block"
            labelHindi="विकास खण्ड"
            value={searchParams.block}
            onChange={(v) => setSearchParams((p) => ({ ...p, block: v }))}
          />
          <FormFieldWithVoice
            id="gram_panchayat"
            label="Gram Panchayat"
            labelHindi="ग्राम पंचायत"
            value={searchParams.gram_panchayat}
            onChange={(v) => setSearchParams((p) => ({ ...p, gram_panchayat: v }))}
          />
          <FormFieldWithVoice
            id="head_name"
            label="Head of Family Name"
            labelHindi="परिवार मुखिया का नाम"
            value={searchParams.head_name}
            onChange={(v) => setSearchParams((p) => ({ ...p, head_name: v }))}
            placeholder="e.g. Kuldeep Singh"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              setHasSearched(true);
              speakText(
                language === 'hi'
                  ? 'परिवार रजिस्टर रिकॉर्ड मिल गया है। कुल 4 सदस्य पंजीकृत हैं। आप प्रमाणित प्रति डाउनलोड कर सकते हैं।'
                  : 'Pariwar register record found. 4 family members registered.'
              );
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navbar hover:bg-navbar-dark text-white text-xs font-bold shadow-sm"
          >
            <Search className="size-4" />
            <span>{language === 'hi' ? 'रजिस्टर रिकॉर्ड खोजें' : 'Search Record'}</span>
          </button>
        </div>
      </div>

      {/* Results View */}
      {hasSearched && (
        <div className="bg-white rounded-2xl border-2 border-emerald-400 p-6 shadow-md space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-emerald-800 text-xs font-bold bg-emerald-100 px-2.5 py-1 rounded-full mb-1">
                <CheckCircle className="size-3.5 text-emerald-600" />
                <span>सत्यापित परिवार रिकॉर्ड (Record Found)</span>
              </div>
              <h3 className="text-base font-bold text-ink-900">
                कुटुंब संख्या: UK-KUT-0982 &bull; ग्राम: {searchParams.gram_panchayat}, जनपद: {searchParams.district}
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1"
              >
                <Printer className="size-3.5" /> Print
              </button>
              <button
                onClick={() => alert('परिवार रजिस्टर प्रमाणित नकल डाउनलोड हो गई है!')}
                className="px-4 py-1.5 bg-navbar text-white rounded-lg text-xs font-bold hover:bg-navbar-dark flex items-center gap-1 shadow-xs"
              >
                <Download className="size-3.5" /> PDF Download
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-gray-200 rounded-lg">
              <thead className="bg-gray-100 text-ink-900 font-bold border-b">
                <tr>
                  <th className="py-2.5 px-3">क्र. सं. (Sr.)</th>
                  <th className="py-2.5 px-3">सदस्य का नाम (Member Name)</th>
                  <th className="py-2.5 px-3">मुखिया से संबंध (Relation)</th>
                  <th className="py-2.5 px-3">आयु (Age)</th>
                  <th className="py-2.5 px-3">शैक्षणिक योग्यता (Literacy)</th>
                  <th className="py-2.5 px-3">व्यवसाय (Occupation)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {familyMembers.map((m) => (
                  <tr key={m.serial} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-500">{m.serial}</td>
                    <td className="py-2.5 px-3 font-semibold text-ink-900">{m.name}</td>
                    <td className="py-2.5 px-3 text-gray-700">{m.relation}</td>
                    <td className="py-2.5 px-3">{m.age} वर्ष</td>
                    <td className="py-2.5 px-3">{m.literacy}</td>
                    <td className="py-2.5 px-3 text-gray-600">{m.occ}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

