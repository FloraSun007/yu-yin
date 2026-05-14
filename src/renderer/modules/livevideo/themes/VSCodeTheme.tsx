export function VSCodeTheme() {
  return (
    <div className="theme-vscode">
      <div className="vsc-titlebar">
        <div className="vsc-menu">
          <span>File</span><span>Edit</span><span>Selection</span><span>View</span>
          <span>Go</span><span>Run</span><span>Terminal</span><span>Help</span>
        </div>
        <div className="vsc-title-text">index.tsx — my-project — Visual Studio Code</div>
        <div className="vsc-window-btns">
          <span className="vsc-win-btn">—</span>
          <span className="vsc-win-btn">□</span>
          <span className="vsc-win-btn close">×</span>
        </div>
      </div>

      <div className="vsc-body">
        <div className="vsc-activity">
          <div className="vsc-act-icon active" title="Explorer">⊞</div>
          <div className="vsc-act-icon" title="Search">⊙</div>
          <div className="vsc-act-icon" title="Source Control">⑂</div>
          <div className="vsc-act-icon" title="Debug">▶</div>
          <div className="vsc-act-icon" title="Extensions">⬡</div>
        </div>

        <div className="vsc-sidebar">
          <div className="vsc-sidebar-title">EXPLORER</div>
          <div className="vsc-tree">
            <div className="vsc-item folder open">▾ 📁 src</div>
            <div className="vsc-item file active">    index.tsx</div>
            <div className="vsc-item file">    App.tsx</div>
            <div className="vsc-item file">    styles.css</div>
            <div className="vsc-item folder">  📁 components</div>
            <div className="vsc-item file">      Header.tsx</div>
            <div className="vsc-item file">      Footer.tsx</div>
            <div className="vsc-item file">      Dashboard.tsx</div>
            <div className="vsc-item folder">  📁 hooks</div>
            <div className="vsc-item file">      useAuth.ts</div>
            <div className="vsc-item file">      useData.ts</div>
            <div className="vsc-item folder">  📁 utils</div>
            <div className="vsc-item file">      helpers.ts</div>
            <div className="vsc-item file">    api.ts</div>
            <div className="vsc-item file">    types.ts</div>
            <div className="vsc-item file">📄 package.json</div>
            <div className="vsc-item file">📄 tsconfig.json</div>
            <div className="vsc-item file">📄 README.md</div>
          </div>
        </div>

        <div className="vsc-editor">
          <div className="vsc-tabs">
            <div className="vsc-tab active">
              <span className="vsc-tab-icon">TS</span> index.tsx <span className="vsc-tab-close">×</span>
            </div>
            <div className="vsc-tab">
              <span className="vsc-tab-icon">TS</span> Dashboard.tsx <span className="vsc-tab-close">×</span>
            </div>
          </div>
          <div className="vsc-code">
            <CodeLine n={1} kw="import" >React, {'{'} useState, useEffect {'}'} <Kw>from</Kw> <Str>'react'</Str>;</CodeLine>
            <CodeLine n={2} kw="import" >{'{'} fetchData {'}'} <Kw>from</Kw> <Str>'./api'</Str>;</CodeLine>
            <CodeLine n={3} kw="import" >{'{'} Header {'}'} <Kw>from</Kw> <Str>'./components/Header'</Str>;</CodeLine>
            <CodeLine n={4} kw="import" >{'{'} Footer {'}'} <Kw>from</Kw> <Str>'./components/Footer'</Str>;</CodeLine>
            <CodeLine n={5} />
            <CodeLine n={6} kw="interface" > <Type>DashboardProps</Type> {'{'}</CodeLine>
            <CodeLine n={7}>  userId: <Type>string</Type>;</CodeLine>
            <CodeLine n={8}>{'}'}</CodeLine>
            <CodeLine n={9} />
            <CodeLine n={10} kw="export default function" > <Fn>Dashboard</Fn>({'{'} userId {'}'}: <Type>DashboardProps</Type>) {'{'}</CodeLine>
            <CodeLine n={11}>  <Kw>const</Kw> [data, setData] = <Fn>useState</Fn>&lt;<Kw>any</Kw>&gt;(<Kw>null</Kw>);</CodeLine>
            <CodeLine n={12}>  <Kw>const</Kw> [loading, setLoading] = <Fn>useState</Fn>(<Kw>true</Kw>);</CodeLine>
            <CodeLine n={13}>  <Kw>const</Kw> [error, setError] = <Fn>useState</Fn>&lt;<Type>string</Type> | <Kw>null</Kw>&gt;(<Kw>null</Kw>);</CodeLine>
            <CodeLine n={14} />
            <CodeLine n={15}>  <Fn>useEffect</Fn>(() =&gt; {'{'}</CodeLine>
            <CodeLine n={16}>    <Kw>const</Kw> loadData = <Kw>async</Kw> () =&gt; {'{'}</CodeLine>
            <CodeLine n={17}>      <Kw>try</Kw> {'{'}</CodeLine>
            <CodeLine n={18}>        <Kw>const</Kw> result = <Kw>await</Kw> <Fn>fetchData</Fn>(userId);</CodeLine>
            <CodeLine n={19}>        <Fn>setData</Fn>(result);</CodeLine>
            <CodeLine n={20}>      {'}'} <Kw>catch</Kw> (err) {'{'}</CodeLine>
            <CodeLine n={21}>        <Fn>setError</Fn>(err <Kw>instanceof</Kw> <Type>Error</Type> ? err.message : <Str>'Unknown'</Str>);</CodeLine>
            <CodeLine n={22}>      {'}'} <Kw>finally</Kw> {'{'}</CodeLine>
            <CodeLine n={23}>        <Fn>setLoading</Fn>(<Kw>false</Kw>);</CodeLine>
            <CodeLine n={24}>      {'}'}</CodeLine>
            <CodeLine n={25}>    {'}'};</CodeLine>
            <CodeLine n={26}>    <Fn>loadData</Fn>();</CodeLine>
            <CodeLine n={27}>  {'}'}, [userId]);</CodeLine>
            <CodeLine n={28} />
            <CodeLine n={29}>  <Kw>if</Kw> (loading) <Kw>return</Kw> &lt;div className=<Str>"loading"</Str>&gt;Loading...&lt;/div&gt;;</CodeLine>
            <CodeLine n={30}>  <Kw>if</Kw> (error) <Kw>return</Kw> &lt;div className=<Str>"error"</Str>&gt;{'{'}error{'}'}&lt;/div&gt;;</CodeLine>
            <CodeLine n={31} />
            <CodeLine n={32}>  <Kw>return</Kw> (</CodeLine>
            <CodeLine n={33}>    &lt;div className=<Str>"dashboard"</Str>&gt;</CodeLine>
            <CodeLine n={34}>      &lt;<Fn>Header</Fn> title=<Str>"Dashboard"</Str> /&gt;</CodeLine>
            <CodeLine n={35}>      &lt;main className=<Str>"content"</Str>&gt;</CodeLine>
            <CodeLine n={36}>        {'{'}data &amp;&amp; (</CodeLine>
            <CodeLine n={37}>          &lt;div className=<Str>"metrics"</Str>&gt;</CodeLine>
            <CodeLine n={38}>            &lt;<Fn>MetricCard</Fn> title=<Str>"Revenue"</Str> value={'{'}data.revenue{'}'} /&gt;</CodeLine>
            <CodeLine n={39}>            &lt;<Fn>MetricCard</Fn> title=<Str>"Users"</Str> value={'{'}data.users{'}'} /&gt;</CodeLine>
            <CodeLine n={40}>          &lt;/div&gt;</CodeLine>
            <CodeLine n={41}>        ){'}'}</CodeLine>
            <CodeLine n={42}>      &lt;/main&gt;</CodeLine>
            <CodeLine n={43}>      &lt;<Fn>Footer</Fn> /&gt;</CodeLine>
            <CodeLine n={44}>    &lt;/div&gt;</CodeLine>
            <CodeLine n={45}>  );</CodeLine>
            <CodeLine n={46}>{'}'}</CodeLine>
          </div>
        </div>
      </div>

      <div className="vsc-statusbar">
        <span>⎇ main</span>
        <span>✕ 0 ⚠ 0</span>
        <span>Ln 32, Col 14</span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span>TypeScript React</span>
        <span>Prettier</span>
      </div>
    </div>
  );
}

function CodeLine({ n, kw, children }: { n: number; kw?: string; children?: React.ReactNode }) {
  return (
    <div className="vsc-line">
      <span className="vsc-ln">{n}</span>
      {kw && <span className="vsc-kw-inline">{kw} </span>}
      {children}
    </div>
  );
}
function Kw({ children }: { children: React.ReactNode }) {
  return <span className="vsc-kw-inline">{children}</span>;
}
function Str({ children }: { children: React.ReactNode }) {
  return <span className="vsc-str">{children}</span>;
}
function Type({ children }: { children: React.ReactNode }) {
  return <span className="vsc-type">{children}</span>;
}
function Fn({ children }: { children: React.ReactNode }) {
  return <span className="vsc-fn">{children}</span>;
}
