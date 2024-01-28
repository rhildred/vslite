import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Dock } from './Dock';
import './Tabs.css';
import React, { useState, useEffect } from 'react';


const LazyTabPanel = props => {
    const [initialized, setInitialized] = useState(false);
    useEffect(() => {
        if (props.selected && !initialized) {
            setInitialized(true);
        }
    }, [props.selected, initialized]);

    return <TabPanel forceRender={initialized} {...props} />;
};
LazyTabPanel.tabsRole = 'TabPanel';


export default () => (
    <Tabs>
        <TabList>
            <Tab>Preview</Tab>
            <Tab>Editor</Tab>
        </TabList>

        <LazyTabPanel>
            <iframe id="previewIFrame" src="preview.html">
            </iframe>
        </LazyTabPanel>
        <LazyTabPanel>
            <Dock />
        </LazyTabPanel>
    </Tabs>
);