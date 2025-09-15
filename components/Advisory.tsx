import React, { useState, useRef, useEffect } from 'react';
import { getCropHealthAnalysis } from '../services/geminiService';
import type { CropHealthAnalysis, CropHealthAnalysisRecord } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { UploadIcon, SparklesIcon } from './icons';
import { addRecord, getRecords, clearRecords } from '../services/analysisHistoryService';
import { useLanguage } from '../contexts/LanguageContext';

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove data url prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

const Advisory: React.FC = () => {
    const { t } = useLanguage();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [analysisResult, setAnalysisResult] = useState<CropHealthAnalysis | string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [history, setHistory] = useState<CropHealthAnalysisRecord[]>([]);
    const [historyOpen, setHistoryOpen] = useState<boolean>(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load saved history on mount
    useEffect(() => {
        setHistory(getRecords());
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            setAnalysisResult(null); // Reset previous results
        }
    };

    const handleAnalyzeClick = async () => {
        if (!imageFile) return;

        setIsLoading(true);
        setAnalysisResult(null);

        try {
            const base64Image = await fileToBase64(imageFile);
            const result = await getCropHealthAnalysis(base64Image, imageFile.type);
            setAnalysisResult(result);
            if (typeof result !== 'string') {
                // Persist successful analysis to history
                // We also keep an image preview as a Data URL for later viewing
                const dataUrl = `data:${imageFile.type};base64,${base64Image}`;
                const record: CropHealthAnalysisRecord = {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    timestamp: new Date().toISOString(),
                    imageDataUrl: dataUrl,
                    result
                };
                addRecord(record);
                setHistory(prev => [record, ...prev].slice(0, 20));
            }
        } catch (error) {
            console.error("Analysis failed:", error);
            setAnalysisResult(t('unexpectedError'));
        } finally {
            setIsLoading(false);
        }
    };

    const ResultDisplay: React.FC<{ result: CropHealthAnalysis }> = ({ result }) => {
        if (result.isHealthy) {
            return (
                <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
                    <h3 className="font-bold">{t('plantIsHealthy')}</h3>
                    <p>{result.description}</p>
                </div>
            );
        }

        const renderList = (title: string, items: string[]) => {
            if (!items || items.length === 0) return null;
            return (
                <div>
                    <h4 className="font-semibold text-lg text-primary">{title}</h4>
                    <ul className="list-disc list-inside space-y-1 text-textSecondary mt-1">
                        {items.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                <div>
                    <h3 className="text-2xl font-bold text-red-600">{result.disease}</h3>
                    <p className="text-textSecondary mt-1">{result.description}</p>
                </div>
                {renderList(t('potentialCauses'), result.causes)}
                {renderList(t('organicRemedies'), result.organicRemedies)}
                {renderList(t('chemicalRemedies'), result.chemicalRemedies)}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">{t('aiCropAdvisory')}</h1>
            <p className="text-textSecondary">
                {t('advisoryDescription')}
            </p>

            <div className="bg-surface p-4 rounded-lg shadow-md">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                {!imagePreview ? (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <UploadIcon />
                        <span className="mt-2 text-textSecondary">{t('tapToUpload')}</span>
                        <span className="text-xs text-gray-500">{t('uploadExample')}</span>
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="relative">
                            <img src={imagePreview} alt="Crop preview" className="w-full h-auto max-h-80 object-contain rounded-lg" />
                             <button
                                onClick={() => {
                                    setImagePreview(null);
                                    setImageFile(null);
                                    setAnalysisResult(null);
                                    if(fileInputRef.current) fileInputRef.current.value = "";
                                }}
                                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1.5 text-xl leading-none"
                                aria-label={t('removeImage')}
                            >
                                &times;
                            </button>
                        </div>
                        <button
                            onClick={handleAnalyzeClick}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center space-x-2 bg-accent text-white px-4 py-3 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400"
                        >
                            <SparklesIcon />
                            <span>{isLoading ? t('analyzing') : t('analyzeCropHealth')}</span>
                        </button>
                    </div>
                )}
            </div>

            {isLoading && (
                 <div className="flex justify-center items-center h-32">
                    <LoadingSpinner />
                </div>
            )}
            
            {analysisResult && !isLoading && (
                 <div className="bg-surface p-4 rounded-lg shadow-md">
                    {typeof analysisResult === 'string' ? (
                        <p className="text-red-500">{analysisResult}</p>
                    ) : (
                        <ResultDisplay result={analysisResult} />
                    )}
                 </div>
            )}
            {/* History Section */}
            <div className="bg-surface p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{t('analysisHistory')}</h2>
                    <div className="space-x-2">
                        <button
                            onClick={() => setHistoryOpen(o => !o)}
                            className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50"
                        >
                            {historyOpen ? t('hide') : t('show')}
                        </button>
                        {history.length > 0 && (
                            <button
                                onClick={() => { clearRecords(); setHistory([]); }}
                                className="px-3 py-1 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50"
                            >
                                {t('clear')}
                            </button>
                        )}
                    </div>
                </div>
                {historyOpen && (
                    history.length === 0 ? (
                        <p className="text-textSecondary mt-2">{t('noAnalysesYet')}</p>
                    ) : (
                        <ul className="mt-3 divide-y">
                            {history.map(item => (
                                <li key={item.id} className="py-3 flex gap-3 items-start">
                                    <img
                                        src={item.imageDataUrl}
                                        alt="Analyzed leaf"
                                        className="w-16 h-16 object-cover rounded border"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium truncate">
                                                {item.result.isHealthy ? t('healthyPlant') : item.result.disease}
                                            </p>
                                            <span className="text-xs text-gray-500">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-textSecondary line-clamp-2 mt-0.5">
                                            {item.result.description}
                                        </p>
                                        {!item.result.isHealthy && item.result.causes?.length > 0 && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {t('causes')}: {item.result.causes.slice(0,2).join(', ')}{item.result.causes.length > 2 ? '…' : ''}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )
                )}
            </div>
        </div>
    );
};

export default Advisory;
