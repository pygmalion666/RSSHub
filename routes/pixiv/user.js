const config = require('../../config');

const pixivConfig = config.pixiv;

if (!pixivConfig) {
    logger.info('Pixiv RSS disable.');
    module.exports = () => {};
    return;
}

const template = require('../../utils/template');
const getToken = require('./token');
const getIllusts = require('./api/getIllusts');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    if (typeof getToken() === 'null') {
        ctx.throw(500);
        return;
    }

    const response = await getIllusts(id, getToken());

    const illusts = response.data.illusts;
    const username = illusts[0].user.name

    ctx.body = template({
        title: `${username} 的 pixiv 动态`,
        link: `https://www.pixiv.net/member.php?id=${id}`,
        description: `${username} 的 pixiv 最新动态`,
        item: illusts.map((illust) => {
            const images = [];
            if (illust.page_count === 1) {
                images.push(`<p><img referrerpolicy="no-referrer" src="https://pixiv.cat/${illust.id}.jpg"/></p>`);
            } else {
                for (let i = 0; i < illust.page_count; i++) {
                    images.push(`<p><img referrerpolicy="no-referrer" src="https://pixiv.cat/${illust.id}-${i+1}.jpg"/></p>`);
                }
            }
            return {
                title: illust.title,
                description: `<p>画师：${username} - 上传于：${new Date(illust.create_date).toLocaleString('zh-cn')} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join('')}`,
                link: `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${illust.id}`
            };
        })
    });
};