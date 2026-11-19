# 历史数据归档

NewsTime 使用“页面历史视图 + 原始事件流水”两层留存方式。

## 页面历史视图

每个菜单顶部都有“历史回顾”入口。页面会把该模块的完整数据集按月份倒序展示，并区分当前、已归档、已降级、基线和已结束状态。当前列表的时间窗口变化不会删除历史记录。

## 原始事件流水

所有自动采集器应把首次发现、版本变化、状态变化和抓取失败追加到：

`data/history/events.ndjson`

该文件一行一个 JSON 对象，不覆盖旧行。`data/` 默认不提交到 Git，部署时应放在持久化磁盘并定期备份。

统一字段：

- `schemaVersion`：结构版本，当前为 `1`
- `id`：稳定事件标识
- `module`：页面模块，如 `apps`、`hardware`、`crowdfunding`
- `type`：事件类型，如 `first_observed`、`version_changed`
- `firstPublishedAt`：来源首次公开时间
- `discoveredAt`：系统首次发现时间
- `checkedAt`：本次核验时间
- `status`：当前、归档、抓取失败等状态
- `title`、`summary`：可读标题与摘要
- `source`：原始来源链接
- `payload`：不裁剪的采集结果或前后版本

竞品 App 抓取脚本已经接入该流水。其他采集器完成后，也必须按相同规则追加事件。

## 手工补录

准备一个 JSON 文件，至少包含 `id`、`module` 和 `title`，然后执行：

```powershell
npm run archive-event -- .\event.json
```
