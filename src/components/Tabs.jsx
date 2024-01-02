import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import {Dock} from './Dock';
import './Tabs.css';
export default () => (
  <Tabs forceRenderTabPanel={true}>
    <TabList>
      <Tab>Preview</Tab>
      <Tab>Editor</Tab>
    </TabList>

    <TabPanel>
      <wp-playground></wp-playground>
    </TabPanel>
    <TabPanel>
       <Dock />
    </TabPanel>
  </Tabs>
);