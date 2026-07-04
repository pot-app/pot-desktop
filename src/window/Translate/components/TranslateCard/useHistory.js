import { useCallback } from 'react';
import Database from 'tauri-plugin-sql-api';

/**
 * Appends a translation entry to the local SQLite history database.
 * Auto-creates the table on first write if it doesn't exist.
 */
export default function useHistory() {
    const addToHistory = useCallback(async (text, source, target, service, resultText) => {
        const db = await Database.load('sqlite:history.db');
        try {
            await db.execute(
                'INSERT into history (text, source, target, service, result, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
                [text, source, target, service, resultText, Date.now()]
            );
        } catch {
            await db.execute(
                'CREATE TABLE history(id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL, source TEXT NOT NULL, target TEXT NOT NULL, service TEXT NOT NULL, result TEXT NOT NULL, timestamp INTEGER NOT NULL)'
            );
            await db.execute(
                'INSERT into history (text, source, target, service, result, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
                [text, source, target, service, resultText, Date.now()]
            );
        } finally {
            db.close();
        }
    }, []);

    return addToHistory;
}
