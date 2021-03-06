const axios = require('axios');
const template = require('../../utils/template');
const config = require('../../config');

module.exports = async (ctx) => {
    const tid = ctx.params.tid;

    const response = await axios({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/newlist?ps=15&rid=${tid}&_=${+new Date()}`,
        headers: {
            'User-Agent': config.ua,
            'Referer': 'https://www.bilibili.com/'
        }
    });

    const list = response.data.data.archives;
    let name = '未知';
    if (list && list[0] && list[0].tname) {
        name = list[0].tname;
    }

    ctx.body = template({
        title: `bilibili ${name}分区`,
        link: 'https://www.bilibili.com',
        description: `bilibili ${name}分区`,
        item: list && list.map((item) => ({
            title: `${item.title} - ${item.owner.name}`,
            description: `${item.desc}<img referrerpolicy="no-referrer" src="${item.pic}">`,
            pubDate: new Date(item.pubdate * 1000).toUTCString(),
            link: `https://www.bilibili.com/video/av${item.aid}`
        })),
    });
};