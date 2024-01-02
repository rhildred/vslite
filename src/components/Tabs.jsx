import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import {Dock} from './Dock';
import './Tabs.css';
export default () => (
  <Tabs forceRenderTabPanel={true}>
    <TabList>
      <Tab>Title 1</Tab>
      <Tab>Title 2</Tab>
    </TabList>

    <TabPanel>
      <wp-playground></wp-playground>
    </TabPanel>
    <TabPanel>
       <Dock />
    </TabPanel>
  </Tabs>
);