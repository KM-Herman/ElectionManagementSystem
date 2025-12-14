import React, { createContext, useContext, useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../store/authStore';

interface SignalRContextType {
    connection: signalR.HubConnection | null;
}

const SignalRContext = createContext<SignalRContextType>({ connection: null });

export const useSignalR = () => useContext(SignalRContext);

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuthStore();
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    useEffect(() => {
        if (!token) return;

        console.log("Initializing SignalR Connection...");
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5273/electionHub", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        setConnection(newConnection);
    }, [token]);

    useEffect(() => {
        if (connection && connection.state === signalR.HubConnectionState.Disconnected) {
            connection.start()
                .then(() => {
                    console.log('SignalR Connected');
                    console.log('Connection ID:', connection.connectionId);
                })
                .catch(err => console.error('SignalR Connection Error: ', err));
            return () => {
                connection.stop();
            };
        }
    }, [connection]);

    return (
        <SignalRContext.Provider value={{ connection }}>
            {children}
        </SignalRContext.Provider>
    );
};