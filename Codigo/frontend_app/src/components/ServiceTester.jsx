// frontend_app/src/components/ServiceTester.jsx
import React, { useState } from 'react';
import { endpoints } from '../api/config';

const ServiceTester = () => {
    const [responseLog, setResponseLog] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentService, setCurrentService] = useState('');

    const testConnection = async (serviceName, url) => {
        setLoading(true);
        setCurrentService(serviceName);
        setResponseLog(null); 

        try {
            const response = await fetch(url);
            const data = await response.json();

            setResponseLog({
                status: response.status,
                ok: response.ok,
                data: data
            });
        } catch (error) {
            console.error("Connection failed:", error);
            setResponseLog({
                status: "Network Error",
                ok: false,
                data: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, borderRight: '2px solid #ccc', paddingRight: '20px' }}>
                <h2>Microservice Control Panel</h2>
                <p>Click a button to ping the API Gateway.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => testConnection('LOGSEC (Login)', endpoints.login)}>Test Secure Login</button>
                    <button onClick={() => testConnection('CORE (Projects)', endpoints.projects)}>Test Projects</button>
                    <button onClick={() => testConnection('CORE (Tasks)', endpoints.tasks)}>Test Tasks</button>
                    <button onClick={() => testConnection('PUBLIC (Info)', endpoints.businessInfo)}>Test Business Info</button>
                    <button onClick={() => testConnection('CHATBOT', endpoints.chat)}>Test AI Chatbot</button>
                    <button onClick={() => testConnection('DOCUMENTS', endpoints.documents)}>Test PDF Reader</button>
                    <button onClick={() => testConnection('ANALYTICS', endpoints.analytics)}>Test Stats View</button>
                </div>
            </div>

            <div style={{ flex: 2 }}>
                <h2>Monitor Screen</h2>
                {loading && <p>Sending request to {currentService} via Gateway...</p>}
                
                {responseLog && !loading && (
                    <div style={{ 
                        backgroundColor: responseLog.ok ? '#e6ffe6' : '#ffe6e6', 
                        padding: '15px', 
                        borderRadius: '8px' 
                    }}>
                        <h3>Target: {currentService}</h3>
                        <p><strong>HTTP Status:</strong> {responseLog.status}</p>
                        <h4>Raw JSON Response from Django:</h4>
                        <pre style={{ backgroundColor: '#222', color: '#0f0', padding: '10px', overflowX: 'auto' }}>
                            {JSON.stringify(responseLog.data, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceTester;