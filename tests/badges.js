const clevis = require("./clevis.js")
clevis.name()
clevis.failToGetCommunity(1)
clevis.createCommunity(0, '0x678183f4d0c4a5e0F2D84c2C8170FA616b3eBE4B', 'comm', 'http')
clevis.createTemplateWithNoCommunity(4, 'template','desc', 'image', 10)
clevis.createTemplate(0, 'template', 'desc', 'image', 10)
clevis.destroyCommunityWithTemplates(0, '0x678183f4d0c4a5e0F2D84c2C8170FA616b3eBE4B', 0)
clevis.createBadge(0, 0, 'tokenuri');
clevis.burnBadge(0, 0);
clevis.destroyTemplate(0, 0)
clevis.destroyCommunity(0, '0x678183f4d0c4a5e0F2D84c2C8170FA616b3eBE4B', 0);
