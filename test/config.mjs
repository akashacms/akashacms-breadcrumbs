

import akasha from 'akasharender';
import { BasePlugin } from '@akashacms/plugins-base';
import { BreadcrumbsPlugin } from '../index.mjs';

const __dirname = import.meta.dirname;

const config = new akasha.Configuration();
config.rootURL("https://example.akashacms.com");
config.configDir = __dirname;
config.addLayoutsDir('layouts')
      .addDocumentsDir('documents');
config.use(BasePlugin);
config.use(BreadcrumbsPlugin);
config.setMahabhutaConfig({
    recognizeSelfClosing: true,
    recognizeCDATA: true,
    decodeEntities: true
});
config.prepare();

export default config;
