const FOLDERS = [
  { name: '收件箱', count: 12, active: true },
  { name: '已发送', count: 0 },
  { name: '草稿箱', count: 2 },
  { name: '垃圾邮件', count: 3 },
  { name: '已删除', count: 0 },
  { name: '归档', count: 0 },
];

const EMAILS = [
  { from: '李总', subject: '关于Q3季度报告的修改意见', time: '10:32', unread: true },
  { from: '张经理', subject: '明天的项目评审会议安排', time: '09:45', unread: true },
  { from: '王工', subject: 'RE: 生产环境部署清单确认', time: '09:12', unread: false },
  { from: '人事部', subject: '2024年度绩效考核通知', time: '昨天', unread: false },
  { from: '陈总监', subject: '新项目立项方案 — 请审阅', time: '昨天', unread: false },
  { from: '产品组', subject: '下周迭代排期表 (v3)', time: '周一', unread: false },
  { from: 'IT部门', subject: '系统维护通知 — 12月15日', time: '周一', unread: false },
  { from: '赵副总', subject: 'FW: 客户反馈汇总', time: '12/08', unread: false },
];

export function EmailTheme() {
  return (
    <div className="theme-email">
      <div className="em-titlebar">
        <span className="em-title-icon">✉</span>
        <span className="em-title-name">收件箱 - Outlook</span>
        <div className="em-titlebar-right">
          <span>—</span><span>□</span><span>×</span>
        </div>
      </div>

      <div className="em-toolbar">
        <span className="em-tbtn">新建邮件</span>
        <span className="em-tbtn">回复</span>
        <span className="em-tbtn">转发</span>
        <span className="em-tbtn">删除</span>
        <span className="em-tbtn">归档</span>
        <span className="em-tbtn">标记</span>
        <span className="em-search">🔍 搜索邮件</span>
      </div>

      <div className="em-body">
        <div className="em-sidebar">
          <div className="em-account">zhangsan@company.com</div>
          {FOLDERS.map((f) => (
            <div key={f.name} className={`em-folder ${f.active ? 'active' : ''}`}>
              <span className="em-folder-name">{f.name}</span>
              {f.count > 0 && <span className="em-folder-badge">{f.count}</span>}
            </div>
          ))}
        </div>

        <div className="em-list">
          {EMAILS.map((e, i) => (
            <div key={i} className={`em-item ${e.unread ? 'unread' : ''} ${i === 0 ? 'selected' : ''}`}>
              <div className="em-item-from">{e.from}</div>
              <div className="em-item-subject">{e.subject}</div>
              <div className="em-item-time">{e.time}</div>
            </div>
          ))}
        </div>

        <div className="em-preview">
          <div className="em-preview-header">
            <div className="em-preview-from">李总</div>
            <div className="em-preview-to">收件人: zhangsan@company.com</div>
            <div className="em-preview-time">今天 10:32</div>
          </div>
          <div className="em-preview-subject">关于Q3季度报告的修改意见</div>
          <div className="em-preview-body">
            <p>你好，</p>
            <p>Q3季度报告我已审阅，有以下几点修改意见：</p>
            <p>1. 第三页的销售数据需要更新为最新数字</p>
            <p>2. 竞品分析部分建议增加市场份额对比图表</p>
            <p>3. 结论部分需要更明确的行动建议</p>
            <p>请在本周五之前完成修改，谢谢。</p>
            <p><br />此致<br />李总</p>
          </div>
        </div>
      </div>

      <div className="em-statusbar">
        <span>12 封未读邮件</span>
        <span>共 128 封</span>
      </div>
    </div>
  );
}
