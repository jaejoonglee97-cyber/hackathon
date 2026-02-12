import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { sheets } from '@/lib/sheets/schema';
import { IS_DEV_MODE } from '@/lib/sheets/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    if (IS_DEV_MODE) {
        return NextResponse.json({ message: 'Dev mode: Skipping Google Sheets init' });
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = google.sheets({ version: 'v4', auth });

    // We have two potential spreadsheets: Auth and Data.
    // We need to check both based on schema definition.
    // Group sheets by sheetId (auth/data)
    const sheetsByFile: Record<string, string[]> = {
        auth: [],
        data: []
    };

    Object.values(sheets).forEach((def) => {
        if (def.sheetId === 'auth') sheetsByFile.auth.push(def.tab);
        else sheetsByFile.data.push(def.tab);
    });

    const logs: string[] = [];

    // Process each spreadsheet file
    for (const [type, requiredTabs] of Object.entries(sheetsByFile)) {
        const spreadsheetId = type === 'auth' ? process.env.AUTH_SHEET_ID : process.env.DATA_SHEET_ID;

        if (!spreadsheetId) {
            logs.push(`[Error] Missing ID for ${type} sheet`);
            continue;
        }

        try {
            const meta = await client.spreadsheets.get({ spreadsheetId });
            const existingTabs = meta.data.sheets?.map(s => s.properties?.title) || [];

            const missingTabs = requiredTabs.filter(tab => !existingTabs.includes(tab));

            if (missingTabs.length === 0) {
                logs.push(`[${type}] All tabs exist.`);
                continue;
            }

            logs.push(`[${type}] Missing tabs: ${missingTabs.join(', ')}. Creating...`);

            // Create missing tabs
            const requests = missingTabs.map(tab => ({
                addSheet: {
                    properties: { title: tab }
                }
            }));

            await client.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: { requests }
            });

            logs.push(`[${type}] Created tabs. Now adding headers...`);

            // Add headers for new tabs
            for (const tab of missingTabs) {
                // find def
                const def = Object.values(sheets).find(d => d.tab === tab && d.sheetId === type);
                if (def) {
                    await client.spreadsheets.values.update({
                        spreadsheetId,
                        range: `${tab}!A1`,
                        valueInputOption: 'RAW',
                        requestBody: { values: [def.columns] }
                    });
                    logs.push(`[${type}] Added header for ${tab}`);
                }
            }

        } catch (error: any) {
            logs.push(`[${type}] Error: ${error.message}`);
        }
    }

    return NextResponse.json({ logs });
}
