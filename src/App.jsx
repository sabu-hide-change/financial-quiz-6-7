// npm install lucide-react recharts firebase

import React, { useState, useEffect } from 'react';
import { Check, X, Home, ChevronRight, BookOpen, Clock, AlertCircle, BarChart2, Save } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// ==========================================
// 1. Firebase Configuration (DO NOT CHANGE VARIABLE NAMES)
// ==========================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ==========================================
// 2. Constants & Init
// ==========================================
const APP_ID = "SmartQuizApp_Ch6_7_v1";

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error", error);
}

// ==========================================
// 3. Quiz Data (全問収録・画像はHTML/Tailwindで再現)
// ==========================================
const ImportantBox = ({ title = "ここが重要", children }) => (
  <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
    <p className="font-bold text-blue-800 border-b border-blue-200 pb-2 mb-2 flex items-center">
      <AlertCircle className="w-5 h-5 mr-2" />
      {title}
    </p>
    <div className="text-sm text-gray-700 space-y-2">
      {children}
    </div>
  </div>
);

const quizData = [
  {
    id: 1,
    title: "問題 1 契約の成立",
    question: "契約に関する説明として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "契約とは、2つ以上の意思表示が合致することによって、当事者間に債権・債務（権利と義務）が発生するものである。" },
      { id: "イ", text: "原則として契約書などの書面がなくても契約は成立する。" },
      { id: "ウ", text: "未成年者は、行為能力が不十分（制限行為能力者）とされ、このような人が行った法律行為は取り消す事ができる場合がある。" },
      { id: "エ", text: "契約の内容の重要な部分について錯誤があった場合、その契約は錯誤した者が無効を主張することができる。" }
    ],
    answer: "エ",
    explanation: (
      <>
        <ImportantBox>
          <p>本問では契約の成立について問われています。</p>
          <p>契約の基本になっている法律は、民法や商法ということになります。民法は条文が1,000以上あり、すべてを学ぶことは現実的ではありません。試験に必要な範囲に絞りこんで、効率よく学習することが大切です。</p>
        </ImportantBox>
        <ul className="space-y-2 text-sm">
          <li><strong>ア ○：</strong> 契約は、簡単に言えば当事者間で合意することです。法律的には、契約は2つ以上の意思表示が合致することによって、当事者間に債権・債務（権利と義務）が発生するものです。例えば、売買契約では、売り手の「売る」という意思表示と、買い手の「買う」という意思表示が合致、すなわち合意することで契約が成立します。また、商品の財産権を相手に引き渡す義務・権利と、これに対する代金の支払いという義務・権利が発生します。</li>
          <li><strong>イ ○：</strong> 原則として契約書などの書面がなくても契約は成立します。ただし、書面は契約の重要な証拠になるため、通常は書面によって契約を締結します。</li>
          <li><strong>ウ ○：</strong> 未成年者が単独で行った法律行為は、原則として取り消すことができます。法律行為を単独で行うことのできる能力のことを「行為能力」と呼びます。未成年者は、行為能力が不十分（制限行為能力者）とされ、このような人が行った法律行為は取り消す事ができます。法律行為を取り消した場合は、契約は無効になります。</li>
          <li><strong>エ ×：</strong> 意思表示の内容を勘違いしていた場合は、「錯誤」があると呼ばれます。契約の内容の重要な部分について錯誤があった場合、原則としてその契約は「取り消すこと」ができます。例えば、販売員が契約の重要な部分について説明せず、顧客が商品の品質を勘違いしていた場合は、契約の取り消しを主張できます。ただし、錯誤した者が注意を著しく欠いていた場合（重過失がある場合）は、契約の取り消しを主張できません。錯誤による意思表示は以前は「無効」とされていましたが、民法改正により「取り消すことができる」へと変更されました。無効と取消しの違いに注意してください。</li>
        </ul>
      </>
    )
  },
  {
    id: 2,
    title: "問題 2 契約の分類",
    question: "契約に関する説明として、最も適切なものはどれか。",
    options: [
      { id: "ア", text: "片務契約の一つとして雇用がある。" },
      { id: "イ", text: "双務契約の一つとして贈与がある。" },
      { id: "ウ", text: "書面によらない消費貸借は要物契約である。" },
      { id: "エ", text: "民法で定めている典型契約には贈与は入っていない。" }
    ],
    answer: "ウ",
    explanation: (
      <>
        <ImportantBox>
          <p>本問では契約の種類とその周辺について問われています。</p>
          <p>民法は、私的自治の原則を採っています。私的自治の原則は、契約自由の原則とも呼ばれます。すなわち、契約などの行為を自分の自由な意思で行うことができることを表します。</p>
          <p>他方、民法ではよく使用される契約を「典型契約」として規定しています。実務においては、典型契約以外の契約が無数にあります。民法はそれらの契約も典型契約と同様に認めています。いってみれば、典型契約は「ひな型」のようなものであると考えればよいでしょう。</p>
        </ImportantBox>
        <ul className="space-y-2 text-sm">
          <li><strong>ア ×：</strong> 片務契約は当事者一方のみに債務が生じる契約で、贈与、無償委任などがあります。雇用は双方に債務が生じるので双務契約になります。</li>
          <li><strong>イ ×：</strong> 双務契約は契約の当事者が互いに債務を負担する契約のことです。贈与は一方のみに債務が生じる片務契約になります。</li>
          <li><strong>ウ ○：</strong> 要物契約とは、契約の成立のために当事者の合意だけではなく物の引き渡しが必要となる契約です。消費賃借は借主が同じ種類、品質及び数量の物をもって返還をすることを約して、相手方から金銭その他の物を受け取ることを内容とする契約です。書面によらない消費貸借は要物契約です。書面による消費賃借は諾成契約になります。</li>
          <li><strong>エ ×：</strong> 典型契約には13種類あり、売買や賃貸借や贈与が入っています。贈与契約は「あげます」「もらいます」という意思表示が合致した契約です。</li>
        </ul>
      </>
    )
  },
  {
    id: 3,
    title: "問題 3 契約の種類",
    question: "各種契約に関する説明として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "委任契約は、一方が相手方から依頼された仕事を完成させ、相手方がこれに対して報酬を与える契約である。" },
      { id: "イ", text: "使用貸借は、当事者の一方がある物を引き渡すことを約し、相手方がその物について契約が終了したときに返還をすることを約することによって、その効力を生ずる。" },
      { id: "ウ", text: "終身定期金契約は、一方が、自己、または相手方もしくは第三者の死亡に至るまで、定期的に金銭その他の物を相手方または第三者に給付する契約である。" },
      { id: "エ", text: "消費貸借契約を書面により締結した場合は、借主は、貸主から金銭を受け取るまでは契約を解除することができる。" }
    ],
    answer: "ア",
    explanation: (
      <>
        <ImportantBox>
          <p>本問では各種の契約について問われています。</p>
          <p>一つ一つの契約の内容に踏み込む前に、どのような契約があるかを確認してください。そのなかで、共通の性質を持つ、似通った類型の契約はどこが異なるのか、整理しておく必要があります。</p>
          <p>たとえば、雇用契約と委任契約はともに労務を提供するという点で共通していますし、賃貸借契約と使用貸借契約はともに物を貸すという点で共通しています。</p>
          <p>それぞれどのように異なるのか整理しておいてください。賃貸借契約は、物を貸して賃料を得るわけですが、使用貸借契約では賃料を請求することはありません。</p>
        </ImportantBox>
        <ul className="space-y-2 text-sm">
          <li><strong>ア ×：</strong> これは、委任契約ではなく、請負契約の説明です。委任契約は、仕事の完成が契約の内容にはなっていません。弁護士への訴訟の委任や、不動産売買の委任などが委任契約の例です。これに対し、請負契約は、建築工事やシステム開発など、業務を外部業者に外注する場合に良く用いられます。</li>
          <li><strong>イ ○：</strong> 使用貸借とは賃貸借のように有償で貸し借りすることではなく、無償で貸し借りすることです。使用貸借契約は当事者の一方がある物を引き渡すことを約し、相手方がその受け取った物について無償で使用及び収益をして契約が終了したときに返還をすることを約することによって、その効力を生じます。</li>
          <li><strong>ウ ○：</strong> 終身定期金契約は、一方が、自己、または相手方もしくは第三者の死亡に至るまで、定期的に金銭その他の物を相手方または第三者に給付する契約です。試験対策としては、出題されることの少ない契約類型ですが、この程度の知識は押さえておきましょう。</li>
          <li><strong>エ ○：</strong> 消費貸借契約は、民法改正により書面が締結された場合に成立する諾成契約となりました。そして借主は貸主からお金等の物を受け取るまでは、契約を解除することができます。</li>
        </ul>
      </>
    )
  },
  {
    id: 4,
    title: "問題 4 契約の履行",
    question: "AはBから100万円のつぼを買い、まだその代金は支払っていない。この場合に関する説明として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "AはBに100万円を貸していた。この金銭債権の弁済期が到来していれば、Aは、Bの承諾なく、この金銭債権をもって、つぼの代金債務と相殺をすることができる。" },
      { id: "イ", text: "Aは100万円の宝石を所有していた。Aは、Bの承諾なく、この宝石をもって、つぼの代金債務の弁済にあてることができる。" },
      { id: "ウ", text: "Bは、このつぼの代金に関し、Aの承諾なく、Aの債務を免除することができる。" },
      { id: "エ", text: "Aは、一定の場合に、Bの承諾なく、供託所に100万円を預け、債務から免れることができる。" }
    ],
    answer: "イ",
    explanation: (
      <>
        <ImportantBox>
          <p>本問では契約の履行について問われています。</p>
          <p>契約成立後に、その内容が債務者によって履行されれば、債権・債務は消滅します。たとえば、100万円の金銭を借りている人が、期日に債権者にこれを返せばこれは「弁済」ということになり、債務は消滅します。しかし、これ以外にも、債権・債務が消滅する場合があります。 代物弁済、供託、相殺、更改 等です。それぞれの特徴を整理しておいてください。なお債権には、金銭債権の他に、特定物債権、種類債権、利息債権、選択債権があります。利息債権は利息の支払いを目的とする債権ですが、従来の民法の法定利率は年5％、商事法定利率は年6%でしたが、令和2年4月施行の改正民法にて、年3%に統合されて、さらに3年ごとに見直しして1%刻みで変動されるようになりました。</p>
        </ImportantBox>
        <ul className="space-y-2 text-sm">
          <li><strong>ア ○：</strong> これは、相殺です。「相殺」は、債務者が債権者に対して同種の債権を有する場合に、その債務と債権を対当額で消滅させることです。相殺できるのは、同種の債権である必要があります。本肢は両方とも金銭債権ですので相殺できます。相殺は、一方的な意思表示で可能ですので、本肢のAはBの承諾なく相殺することができます。</li>
          <li><strong>イ ×：</strong> Bの承諾があれば、代物弁済となります。「代物弁済」は、債務者が、債権者の承諾を得た上で、本来の給付に代えて他の給付をすることです。本肢は、Bの承諾を得ていないので成立しません。</li>
          <li><strong>ウ ○：</strong> これは免除です。「免除」は、債権者が債権を無償で消滅させる意思表示をすることです。免除も債権の消滅原因の一つです。</li>
          <li><strong>エ ○：</strong> これは供託です。「供託」は、債権者が受領を拒んだり、受領することができない場合に、債務者が供託所（法務局）に弁済目的物を預けることです。供託によって、債務が消滅します。</li>
        </ul>
      </>
    )
  },
  {
    id: 5,
    title: "問題 5 保証",
    question: "AはBから100万円を借り受け、CはAの債務を連帯保証した。この場合に関する説明として、最も適切なものはどれか。",
    options: [
      { id: "ア", text: "BC間の保証契約は、口頭でしたとしても、その効力を生じる。" },
      { id: "イ", text: "BがAに対する債権をDに譲渡し、その旨をAに通知したとき、DはAに対し100万円の請求はできるがCに対しては請求できない。" },
      { id: "ウ", text: "AがBに100万円の弁済をした場合、CのBに対する保証債務も消滅する。" },
      { id: "エ", text: "BがCに請求してきた際、CがAに弁済の資力があり、かつ執行が容易であることを証明すれば、BはまずAに履行を請求しなければならない。" }
    ],
    answer: "ウ",
    explanation: (
      <>
        <ImportantBox>
          <p>本問では連帯保証について問われています。</p>
          <p>連帯保証は保証の一種であり、催告の抗弁権や検索の抗弁権がない、などの特徴がありますが、そのほかは一般の保証の性質を持っています。問題を解くときも、原則は一般の保証と同様に解いてください。</p>
          <p>このように3人以上の人が出てくる問題は、連帯保証は輪で結ぶなど図示すると考えやすくなります。</p>
          {/* テキスト図解 */}
          <div className="bg-white border p-4 my-2 text-center rounded flex flex-col items-center justify-center space-y-4">
            <div className="flex justify-between w-full max-w-md items-center relative">
              <div className="flex flex-col items-center">
                <span className="bg-gray-200 p-2 rounded-full">B</span>
                <span className="font-bold text-blue-600">債権者</span>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center relative">
                <div className="w-full border-t-2 border-red-400 absolute top-1/4 transform -rotate-12"></div>
                <div className="w-full border-t-2 border-red-400 absolute bottom-1/4 transform rotate-12"></div>
                <div className="border-2 border-red-500 rounded-full w-12 h-24 absolute z-10 flex items-center justify-center bg-white opacity-80 text-xs font-bold text-red-600">
                  連帯
                </div>
              </div>

              <div className="flex flex-col justify-between h-32">
                <div className="flex flex-col items-center">
                  <span className="bg-gray-200 p-2 rounded-full">A</span>
                  <span className="font-bold text-blue-600">債務者</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="bg-gray-200 p-2 rounded-full">C</span>
                  <span className="font-bold text-blue-600">保証人</span>
                </div>
              </div>
            </div>
          </div>
        </ImportantBox>
        <ul className="space-y-2 text-sm">
          <li><strong>ア ×：</strong> 保証を行う場合は、債権者は、保証人と保証契約を書面または電磁的記録で締結する必要があります。すべての保証契約は、書面または電磁的記録でされない限り無効です。</li>
          <li><strong>イ ×：</strong> これは保証債務の随伴性の問題です。随伴性は、主債務が債権譲渡等によって移転すれば、保証債務も一緒に移転することです。DはCに対し、100万円の請求ができます。</li>
          <li><strong>ウ ○：</strong> これは保証債務の附従性の問題です。附従性は、主債務が消滅すれば保証債務も一緒に消滅することです。Aが弁済して主たる債務が消滅すれば、Cの保証債務も消滅します。</li>
          <li><strong>エ ×：</strong> これは検索の抗弁権の問題です。連帯保証では、保証人には「催告の抗弁権」と「検索の抗弁権」がありません。したがって、Cはこのようなことは抗弁できません。</li>
        </ul>
      </>
    )
  },
  {
    id: 6,
    title: "問題 6 契約の不履行",
    question: "AはBに1000万円の債務を負っている。この場合に関する説明として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "Aは事業資金としてBから1000万円借り受け、10月1日に返済する予定であったが、失念している。これは履行遅滞の問題である。" },
      { id: "イ", text: "Aは事業資金としてBから1000万円借り受け、10月1日に返済する予定であったが、事業に失敗し、全ての財産を清算したが、1000万円は絶対に返済できないことが分かった。これは履行不能の問題である。" },
      { id: "ウ", text: "AはBから別荘を買ったが、引渡しを受ける前日に山火事で別荘が焼失した。これは、危険負担の問題である。" },
      { id: "エ", text: "AはBから別荘を買い、引渡しを受けた後に別荘にBも知らない白アリが巣食っていることを発見した。これは、契約不適合責任の問題である。" }
    ],
    answer: "イ",
    explanation: (
      <>
        <ImportantBox>
          <p>本問では契約の不履行について問われています。</p>
          <p>契約が履行されない場合、さまざまな問題が考えられます。どの領域の問題であるのかをしっかり整理する必要があります。</p>
          <p>本問を通じて、契約不履行のケースを整理してください。</p>
        </ImportantBox>
        <ul className="space-y-2 text-sm">
          <li><strong>ア ○：</strong> これは、「債務不履行」のうち、「履行遅滞」にあたります。履行遅滞は、契約で定めた履行期に遅れることです。履行遅滞は、期日に遅れたものの履行自体は可能な状況の場合を表します。</li>
          <li><strong>イ ×：</strong> これは｢履行不能」の問題ではなく、「履行遅滞」にあたります。履行不能は、契約で定めた履行が不能になることです。例えば、売買目的の物を、債務者の不注意で紛失してしまい、引き渡しが不能になるような場合です。金銭債権の場合、お金自体がなくなったわけではないので、履行不能の問題は起きません。金銭債権では履行不能の問題は起きないので、選択肢イの記述は不適切です。</li>
          <li><strong>ウ ○：</strong> これは「危険負担」の問題です。売買契約締結後、引渡しの前までに、売主が責を負わない事由によって売主の引渡義務が履行できなくなった場合に、買主の代金支払債務が消滅するのか、しないのかの問題です。危険負担は、債務者主義が原則です。本肢の場合、危険は引渡債務者である売主Ｂの負担となり、Ａは契約を解除して代金支払を拒むことができます。</li>
          <li><strong>エ ○：</strong> これは「契約不適合責任」の問題です（民法改正前の瑕疵担保責任）。契約不適合責任は、売買契約等で、契約は履行されたものの、目的物に欠陥などの契約不適合があった場合の、売主の責任を指します。売主の故意・過失を要件とせず、たとえ売主が契約不適合を知らなかった場合でも、買主は、目的物の修補、代替物または不足分の引渡しによる履行の追完や代金減額を請求することができる点に注意してください。</li>
        </ul>
      </>
    )
  },
  {
    id: 7,
    title: "問題 7 契約の不履行2",
    question: "AはBに絵画を売却した代金として100万円の債権を持っているが、期日になってもBは支払わない。この場合に関する説明として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "Aは強制履行により代金を取り立てることができる。" },
      { id: "イ", text: "AはBに対して損害賠償の請求ができる。損害賠償請求権の消滅時効は、原則として権利を行使できることを知った時から５年間である。" },
      { id: "ウ", text: "AはBとの契約を解除することができる。その場合は、損害賠償の請求はできなくなる。" },
      { id: "エ", text: "契約が解除された場合は、契約は最初から無かったものとされるため、A・Bは互いに受け取っていた物や金銭を返却する必要がある。" }
    ],
    answer: "ウ",
    explanation: (
      <>
        <ImportantBox>
          <p>本問では債務不履行の対抗手段について問われています。</p>
          <p>債務不履行がなされた場合、債権者としては、強制履行、損害賠償請求、契約の解除、等の手段をとることが認められています。</p>
        </ImportantBox>
        <ul className="space-y-2 text-sm">
          <li><strong>ア ○：</strong> 債務不履行が生じた場合、債権者は、強制履行や損害賠償請求、契約の解除といった手段を取ることができます。</li>
          <li><strong>イ ○：</strong> 債務不履行が生じた場合には、債権者は債務者に対して損害賠償を請求することができます。消滅時効は原則5年です。</li>
          <li><strong>ウ ×：</strong> 債務不履行の場合は、債権者は一方的に契約を解除することができます（法定解除権）。しかし、解除権を行使したのちも損害があればその賠償請求はできますので、その部分が誤りです。</li>
          <li><strong>エ ○：</strong> 原状回復義務に関する正しい説明です。</li>
        </ul>
      </>
    )
  },
  {
    id: 8,
    title: "問題 8 不法行為",
    question: "Aは歩行中、わき見運転をしていたピザ宅配会社B社の社員Cのバイクにはねられ、負傷した。この場合に関する説明として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "Aは、治療費等の損害をCに対し、賠償請求することができる。" },
      { id: "イ", text: "Aは、Cがピザの配達中の事故であれば、Bに対して損害賠償の請求ができる。" },
      { id: "ウ", text: "Bは、Cの選任・監督について相当な注意をしたときは、Aに対する損害賠償責任を負わない。" },
      { id: "エ", text: "Aは、損害及び加害者を知らない限り、損害賠償請求権は消滅することはない。" }
    ],
    answer: "エ",
    explanation: (
      <>
        <ImportantBox>
          <p>本問では不法行為に関連して、使用者責任や損害賠償請求権の消滅時効について問われています。</p>
        </ImportantBox>
        <ul className="space-y-2 text-sm">
          <li><strong>エ ×：</strong> 人の生命または身体に対する不法行為による損害賠償請求権の消滅時効は、被害者または法定代理人が、損害および加害者を知ったときから５年となっています。さらに、不法行為の時から20年を経過した場合も、権利は消滅します。したがって、いつまでも損害賠償の請求ができるわけではありません。</li>
        </ul>
      </>
    )
  },
  {
    id: 9,
    title: "問題 9 担保物権",
    question: "担保物権に関する説明として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "抵当権には、優先弁済効力はあるが、留置的効力はない。" },
      { id: "イ", text: "質権には、優先弁済効力はあるが、留置的効力はない。" },
      { id: "ウ", text: "留置権には、優先弁済効力はないが、留置的効力はある。" },
      { id: "エ", text: "先取特権には、優先弁済効力はあるが、留置的効力はない。" }
    ],
    answer: "イ",
    explanation: (
      <>
        <ImportantBox>
          <p>本問では担保物権について問われています。</p>
          <p>担保物権について基本的なところは押さえておくようにしましょう。</p>
        </ImportantBox>
        <div className="overflow-x-auto my-4">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2"></th>
                <th className="border border-gray-300 p-2">優先弁済効力</th>
                <th className="border border-gray-300 p-2">留置的効力</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2 font-bold text-center">留置権</td><td className="border border-gray-300 p-2 text-center">×</td><td className="border border-gray-300 p-2 text-center">○</td></tr>
              <tr><td className="border border-gray-300 p-2 font-bold text-center">先取特権</td><td className="border border-gray-300 p-2 text-center">○</td><td className="border border-gray-300 p-2 text-center">×</td></tr>
              <tr><td className="border border-gray-300 p-2 font-bold text-center">質権</td><td className="border border-gray-300 p-2 text-center">○</td><td className="border border-gray-300 p-2 text-center">○</td></tr>
              <tr><td className="border border-gray-300 p-2 font-bold text-center">抵当権</td><td className="border border-gray-300 p-2 text-center">○</td><td className="border border-gray-300 p-2 text-center">×</td></tr>
            </tbody>
          </table>
        </div>
        <ul className="space-y-2 text-sm">
          <li><strong>イ ×：</strong> 表の通り、質権には、優先弁済効力と留置的効力の両方があります。</li>
        </ul>
      </>
    )
  },
  {
    id: 10,
    title: "問題 10 独占禁止法",
    question: "独占禁止法に関する説明として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "独占禁止法は、一部の企業による独占や、不公正な取引などを規制する法律で、公正で自由な競争を促進することで、一般消費者の利益を実現することを目的としている。" },
      { id: "イ", text: "私的独占は、事業者が強力な資金力を用いて、他の事業者を市場から排除したり、支配することである。" },
      { id: "ウ", text: "不公正な取引方法というのは、公正な競争を阻害するおそれがあるもので、法律に規定される取引方法や公正取引委員会が指定した取引方法がある。その内容はたとえば、取引拒絶、不当廉売、抱き合わせ販売などであり、高額で購入することは含まれない。" },
      { id: "エ", text: "カルテルや入札談合等に関与した事業者に対して、違法行為の申し出や、調査協力をした場合に、課徴金が減免される制度がある。" }
    ],
    answer: "ウ",
    explanation: (
      <>
        <ImportantBox>
          <p>本問では独占禁止法について問われています。</p>
        </ImportantBox>
        <ul className="space-y-2 text-sm">
          <li><strong>ウ ×：</strong> 不当高価購入も不公正な取引方法の一つであり、高額での購入がこれに当たる可能性があります。</li>
        </ul>
      </>
    )
  },
  {
    id: 11,
    title: "問題 11 消費者保護に関する法律",
    question: "消費者保護法制に関する説明として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "消費者契約法は、事業者と消費者の契約の際に、契約の重要事項について不実告知や、不当な勧誘がされたことにより、消費者が誤認または困惑して契約をした場合には、その契約は無効である旨を規定している。" },
      { id: "イ", text: "消費者契約法は、事業者は消費者にとって一方的に不利益な契約条項を定めることはできないと規定する。" },
      { id: "ウ", text: "割賦販売法は、割賦販売では、消費者が後で申込みの撤回ができる「クーリング・オフ」の制度を設けている。" },
      { id: "エ", text: "特定商取引法は、訪問販売や通信販売、電話勧誘販売、連鎖販売といった特定商取引について、それぞれに規制を設ける法律である。" }
    ],
    answer: "ア",
    explanation: (
      <>
        <ul className="space-y-2 text-sm">
          <li><strong>ア ×：</strong> 消費者契約法は、消費者が誤認または困惑して契約をした場合には、消費者は契約を「取り消す」ことができます。「無効」になるわけではありませんので、不適切です。</li>
        </ul>
      </>
    )
  },
  {
    id: 12,
    title: "問題 12 製造物責任法",
    question: "製造物責任法に関する説明として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "製造物責任法では、製造業者の過失を要件とせず、製造物に欠陥があったことのみで、損害賠償責任を追及できる。" },
      { id: "イ", text: "製造物にその製造業者と誤認させるような氏名の表示をしただけの者は、製造物責任法上の責任を負わない。" },
      { id: "ウ", text: "製造物責任法に基づく損害賠償請求権は、被害者またはその法定代理人が損害および賠償義務者を知った時から３年間を行使しないときは、時効によって消滅する。" },
      { id: "エ", text: "製造物責任法における製造物には、未加工の農林畜水産物は該当しない。" }
    ],
    answer: "イ",
    explanation: (
      <ul className="space-y-2 text-sm">
        <li><strong>イ ×：</strong> 製造物責任法では、実際に製造物を製造していなくても、その氏名、商標等の表示をした者や、その製造業者と誤認させるような氏名の表示をした者を、製造業者等として製造物責任を負うこととしています。</li>
      </ul>
    )
  },
  {
    id: 13,
    title: "問題 13 景品表示法",
    question: "景品表示法に関する説明として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "優良誤認表示とは、商品・サービスの内容が、実際のものや競合他社よりも著しく優良であると誤認させることであり、有利誤認表示とは、商品・サービスの価格や取引条件が、実際のものや競合他社よりも著しく有利であると誤認させることである。" },
      { id: "イ", text: "内閣総理大臣は、景品表示法の違反行為があるとみとめたときは、その事業者に対して、誤認の排除，再発防止策の実施，今後同様の違反行為を行わないことなどを命ずる措置命令をすることができる。" },
      { id: "ウ", text: "商店街が実施する福引などの共同懸賞は、以前からの風習であることや、個別事業者の不当な利益の獲得にはつながりにくいことなどから、景品規制から除外されている。" },
      { id: "エ", text: "景品表示法における景品類は、顧客を誘引する手段として、事業者が自己の供給する商品・サービスの取引に付随して提供する、物品・金銭その他の経済上の利益を指す。" }
    ],
    answer: "ウ",
    explanation: (
      <ul className="space-y-2 text-sm">
        <li><strong>ウ ×：</strong> 商店街が実施する福引などの共同懸賞も、景品類のひとつとして景品表示法の規制対象になっています。</li>
      </ul>
    )
  },
  {
    id: 14,
    title: "問題 14 国際取引",
    question: "国際取引に関する次の文中の空欄Ａ～Ｄに入る語句の組み合わせとして、最も適切なものを下記の解答群から選べ。\n（ Ａ ）では、国際貿易の統一規則が規定されている。（ Ｂ ）とは、商品を本船に船積された時に、引渡し義務が終了する取引条件である。CIFでは、（ Ｃ ）は、貨物を荷揚げ地の港で荷揚げするまでの運賃、海上保険料等を負担し、荷揚げ以降の費用は（ Ｄ ）の負担となる。",
    options: [
      { id: "ア", text: "Ａ：インコタームズ Ｂ：FOB Ｃ：買主 Ｄ：売主" },
      { id: "イ", text: "Ａ：インコタームズ Ｂ：FOB Ｃ：売主　Ｄ：買主" },
      { id: "ウ", text: "Ａ：準拠法 Ｂ：CFR Ｃ：買主 Ｄ：売主" },
      { id: "エ", text: "Ａ：準拠法 Ｂ：CFR Ｃ：売主　Ｄ：買主" }
    ],
    answer: "イ",
    explanation: (
      <>
        <ImportantBox>
          <p>本問では国際取引について問われています。FOBやCIFはインコタームズで定められています。</p>
          <div className="mt-4 p-4 border rounded bg-white">
            <p className="text-center font-bold mb-2">FOBとCIFの概略 (海上輸送・費用関係)</p>
            <div className="flex flex-col space-y-2 text-sm">
              <div className="flex w-full">
                <div className="w-1/4 text-center font-semibold bg-gray-200 p-1 rounded-l">船積前</div>
                <div className="w-2/4 text-center font-semibold bg-blue-100 p-1">海上輸送 (船積 → 荷揚)</div>
                <div className="w-1/4 text-center font-semibold bg-gray-200 p-1 rounded-r">荷揚後</div>
              </div>
              <div className="flex w-full border border-blue-300">
                <div className="w-3/4 bg-cyan-100 p-2 text-center text-xs font-bold border-r border-blue-300">CIF (売主負担: 船積前〜荷揚まで)</div>
                <div className="w-1/4 bg-orange-100 p-2 text-center text-xs font-bold">買主負担</div>
              </div>
              <div className="flex w-full border border-orange-300">
                <div className="w-1/4 bg-cyan-100 p-2 text-center text-xs font-bold border-r border-orange-300">売主負担</div>
                <div className="w-3/4 bg-orange-100 p-2 text-center text-xs font-bold">FOB (買主負担: 船積以降)</div>
              </div>
            </div>
          </div>
        </ImportantBox>
        <ul className="space-y-2 text-sm mt-4">
          <li><strong>イ ○：</strong> Ａ：インコタームズ、Ｂ：FOB、Ｃ：売主、Ｄ：買主。CIFでは売主が荷揚げまでの費用を負担します。</li>
        </ul>
      </>
    )
  },
  {
    id: 15,
    title: "問題 15 国際条約、国際出願",
    question: "知的財産権に関する国際条約や国際出願に関する記述として、最も適切なものはどれか。",
    options: [
      { id: "ア", text: "国際出願では、各国で審査を受けるに際し、所定の翻訳文を提出する等の国内移行手続をまず行う必要がある。" },
      { id: "イ", text: "マドリッド協定議定書は、商標の国際出願制度であり、日本での商標登録出願をしなくても制度を利用して外国での商標権の取得をすることができる。" },
      { id: "ウ", text: "マドリッド協定議定書に基づいて国際出願を行う場合の出願する商標と基礎となる商標は、同一性のある範囲なら変更することができる。" },
      { id: "エ", text: "パリ条約に規定する優先権の期間について、商標に認められる期間は12か月である。" }
    ],
    answer: "ア",
    explanation: (
      <ul className="space-y-2 text-sm">
        <li><strong>ア ○：</strong> 国際出願では、各国で審査を受けるに際し、所定の翻訳文を提出する等の国内移行手続をまず行う必要があります。</li>
        <li><strong>イ ×：</strong> マドリッド協定議定書では、日本での商標登録出願（または登録）が必要です。</li>
        <li><strong>ウ ×：</strong> マドリッド協定議定書に基づく出願商標は基礎となる商標と同一でなければなりません。</li>
        <li><strong>エ ×：</strong> パリ条約の優先権期間は、特許・実用新案は12か月、意匠・商標は6か月です。</li>
      </ul>
    )
  },
  {
    id: 16,
    title: "問題 16 倒産に関する法律1",
    question: "倒産に関する法律について、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "倒産は企業が経済的に破たんすることであり、一般的には、手形が不渡になって銀行取引停止処分となった場合などをさす。" },
      { id: "イ", text: "特別清算は、清算中の株式会社について、清算の遂行に著しい支障があるか、債務超過の疑いがある時に行われる特殊な清算手続きである。" },
      { id: "ウ", text: "民事再生は、経済的に窮地にある債務者の事業の再生をすることを目的とし、法人だけでなく個人も行うことができる。" },
      { id: "エ", text: "会社更生は、倒産に至る前の比較的早期の段階にある会社を再建する手続きで、全ての会社が対象で、個人は行うことができない。" }
    ],
    answer: "エ",
    explanation: (
      <ul className="space-y-2 text-sm">
        <li><strong>エ ×：</strong> 会社更生は、株式会社に限って認められている倒産処理です。すべての会社に適用があるわけではありません。</li>
      </ul>
    )
  },
  {
    id: 17,
    title: "問題 17 倒産に関する法律2",
    question: "倒産に関する次の文中の空欄Ａ～Fに入る語句の組み合わせとして、最も適切なものを下記の解答群から選べ。\n倒産した企業の財産を清算する（ Ａ ）の手続きと、事業の継続を図る（ Ｂ ）の手続きがある。（ Ａ ）の倒産処理には（ Ｃ ）と（ Ｄ ）があり、（ Ｂ ）の倒産処理には（ Ｅ ）と（ Ｆ ）がある。",
    options: [
      { id: "ア", text: "Ａ：清算型　Ｂ：再建型　Ｃ：民事再生　Ｄ：会社再生　Ｅ：特別清算　Ｆ：破産" },
      { id: "イ", text: "Ａ：再建型　Ｂ：清算型　Ｃ：民事再生　Ｄ：特別清算　Ｅ：会社更生　Ｆ：破産" },
      { id: "ウ", text: "Ａ：清算型　Ｂ：再建型　Ｃ：破産　Ｄ：特別清算　Ｅ：民事再生　Ｆ：会社更生" },
      { id: "エ", text: "Ａ：再建型　Ｂ：清算型　Ｃ：破産　Ｄ：会社更生　Ｅ：民事再生　Ｆ：特別清算" }
    ],
    answer: "ウ",
    explanation: (
      <>
        <ImportantBox>
          <p>倒産処理の種類</p>
          <ul className="list-disc pl-5 mt-2">
            <li><strong>法的整理</strong>
              <ul className="list-circle pl-5 mt-1 text-gray-600">
                <li><strong>再建型:</strong> 会社更生法、民事再生法</li>
                <li><strong>清算型:</strong> 破産法、特別清算</li>
              </ul>
            </li>
            <li><strong>私的整理</strong> (再建型 / 清算型)</li>
          </ul>
        </ImportantBox>
        <p className="text-sm mt-2">正解はウ。清算型には破産と特別清算、再建型には民事再生と会社更生があります。</p>
      </>
    )
  },
  {
    id: 18,
    title: "問題 18 相続",
    question: "相続に関する法律について、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "個人事業主が死亡した場合、事業上のものであるか否かを問わず、その者の積極財産、消極財産はすべて相続の対象となる。" },
      { id: "イ", text: "相続人が、相続によって得た財産の限度においてのみ、被相続人の債務を弁済すべきことを留保して相続の承認をすることができ、これを限定承認という。" },
      { id: "ウ", text: "負債を相続したくないときには、家庭裁判所で相続放棄の手続きを行うと、初めから相続人にならなかったとみなされる。" },
      { id: "エ", text: "遺産分割協議によって、相続人は遺産を分割することができる。この場合の遺産とは積極財産ばかりではなく、消極財産も含まれる。" }
    ],
    answer: "エ",
    explanation: (
      <ul className="space-y-2 text-sm">
        <li><strong>エ ×：</strong> 遺産分割の対象となる遺産とは積極財産（プラスの財産）のみを指し、消極財産（マイナスの財産＝負債）は遺産分割の対象とはなりません。負債は法定相続分に応じて当然に分割相続されます。</li>
      </ul>
    )
  },
  {
    id: 19,
    title: "問題 19 相続2",
    question: "被相続人Ｘが死亡し、相続が生じた。ＡはＸの配偶者、ＢはＸ及びＡの子、ＣはＢの子。Ｘには兄弟姉妹Ｄがおり、ＥはＤの子。Ｘには内縁関係のＧがいる。その他の親族は死亡済み。\nＸの相続財産について、それぞれの相続人が相続する割合として、最も適切なものはどれか。",
    options: [
      { id: "ア", text: "Ｘの死亡以前にＢが死亡していた場合、Ａが4分の3、Ｄが4分の1を相続する。" },
      { id: "イ", text: "Ｂが相続放棄をした場合、Ａが2分の1、Ｃが2分の1を相続する。" },
      { id: "ウ", text: "Ｘの死亡以前にＤが死亡しており、Ｂが相続放棄をした場合、Ａが4分の3、Ｅが4分の1を相続する。" },
      { id: "エ", text: "Ｘの死亡以前にＡ、Ｂ、Ｃ、Ｄ、Ｅのすべてが死亡していた場合に、ＧがＸの相続財産のすべてを相続する。" }
    ],
    answer: "ウ",
    explanation: (
      <ul className="space-y-2 text-sm">
        <li><strong>ウ ○：</strong> Ｂが相続放棄をしているため、次順位の兄弟姉妹Ｄが相続人となりますが、Ｄが死亡しているため代襲相続が発生し、Ｅが相続人となります。配偶者と兄弟姉妹（その代襲者）の組み合わせなので、Ａが3/4、Ｅが1/4となります。</li>
      </ul>
    )
  },
  {
    id: 20,
    title: "問題 20 遺留分",
    question: "遺留分に関する法律について、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "遺留分は、被相続人の財産のうち、一定の割合の承継を法定相続人に保証する制度であるが、兄弟姉妹には認められていない。" },
      { id: "イ", text: "直系尊属のみが相続人の場合、被相続人の財産の3分の１が遺留分である。" },
      { id: "ウ", text: "遺留分侵害額請求は相続開始および遺留分を侵害する贈与等のあったことを知った時から1年以内に行わなければならない。" },
      { id: "エ", text: "遺留分の権利者は、遺留分を侵害している受遺者や受贈者に対して、遺留分侵害額に相当する金銭の支払を請求することはできない。" }
    ],
    answer: "エ",
    explanation: (
      <ul className="space-y-2 text-sm">
        <li><strong>エ ×：</strong> 遺留分侵害額請求は、遺留分権利者が受遺者や受贈者に対して、侵害額に相当する「金銭の支払」を請求することができます。請求できないというのは誤りです。</li>
      </ul>
    )
  },
  {
    id: 21,
    title: "問題 21 遺留分特例",
    question: "先代経営者甲が死亡。配偶者乙は死亡済、子Ａ、Ｂ、Ｃが相続。財産は不動産3000万円のみ。Ａは生前に自社株式（当時3000万円、現在1億2000万円）の贈与を受けている。\n遺留分に関する民法の特例の説明として、最も適切なものはどれか。",
    options: [
      { id: "ア", text: "Ａが生前贈与を受けた自社株式3,000万円について除外合意の対象となっている場合、Ｂの遺留分の額は750万円である。" },
      { id: "イ", text: "Ａが生前贈与を受けた自社株式3,000万円についてこの額で固定合意の対象となっている場合、Ｂの遺留分の額は1,500万円である。" },
      { id: "ウ", text: "除外合意や固定合意などの特段の合意がない場合、Ｂの遺留分の額は2,500万円である。" },
      { id: "エ", text: "Ａが生前贈与を受けた自社株式3,000万円のうち、1,500万円が除外合意の対象となり、残りの1,500万円がこの額で固定合意の対象となっている場合、Ｂの遺留分の額は1,125万円である。" }
    ],
    answer: "ウ",
    explanation: (
      <ul className="space-y-2 text-sm">
        <li><strong>ウ ○：</strong> 特段の合意がない場合、遺留分算定基礎財産は不動産3000万＋贈与株式（相続開始時）1億2000万＝1億5000万円。遺留分総額はその1/2の7500万円。これを子3人で等分するので、Ｂの遺留分は2500万円となります。</li>
      </ul>
    )
  }
];

// ==========================================
// 4. Main App Component
// ==========================================
export default function App() {
  const [view, setView] = useState('login'); // 'login', 'home', 'quiz', 'history'
  const [secretKey, setSecretKey] = useState('');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Quiz State
  const [quizMode, setQuizMode] = useState('all'); // 'all', 'wrong', 'review'
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Resume State
  const [resumeData, setResumeData] = useState(null);

  // Auth & Init
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (auth) {
          await signInAnonymously(auth);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Auth error:", error);
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleLogin = async () => {
    if (!secretKey.trim()) return;
    setIsLoading(true);
    try {
      const docRef = doc(db, APP_ID, secretKey);
      const docSnap = await getDoc(docRef);
      
      let data = { history: {} };
      if (docSnap.exists()) {
        data = docSnap.data();
      } else {
        await setDoc(docRef, data);
      }
      
      setUserData(data);
      
      // Check for resume progress
      if (data.progressIndex !== undefined && data.progressMode) {
        setResumeData({ index: data.progressIndex, mode: data.progressMode });
      } else {
        setResumeData(null);
      }
      
      setView('home');
    } catch (error) {
      console.error("Login/Fetch error:", error);
    }
    setIsLoading(false);
  };

  const saveProgressToFirestore = async (index, mode) => {
    if (!secretKey) return;
    try {
      const docRef = doc(db, APP_ID, secretKey);
      await updateDoc(docRef, {
        progressIndex: index,
        progressMode: mode
      });
      console.log(`Progress saved: index ${index}, mode ${mode}`);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const clearProgressFromFirestore = async () => {
    if (!secretKey) return;
    try {
      const docRef = doc(db, APP_ID, secretKey);
      await updateDoc(docRef, {
        progressIndex: null,
        progressMode: null
      });
      console.log("Progress cleared");
    } catch (error) {
      console.error("Error clearing progress:", error);
    }
  };

  const startQuiz = async (mode, startFromIndex = 0) => {
    let filtered = [];
    if (mode === 'all') {
      filtered = [...quizData];
    } else if (mode === 'wrong') {
      filtered = quizData.filter(q => userData?.history?.[q.id]?.lastResult === false);
    } else if (mode === 'review') {
      filtered = quizData.filter(q => userData?.history?.[q.id]?.review === true);
    }

    if (filtered.length === 0) {
      alert("該当する問題がありません！");
      return;
    }

    setQuizMode(mode);
    setActiveQuestions(filtered);
    setCurrentIndex(startFromIndex);
    setSelectedOption(null);
    setIsAnswered(false);
    setView('quiz');

    // Save initial progress if starting fresh
    if (startFromIndex === 0) {
      await saveProgressToFirestore(0, mode);
    }
  };

  const resumeQuiz = async () => {
    if (resumeData) {
      await startQuiz(resumeData.mode, resumeData.index);
    }
  };

  const handleAnswer = async (optId) => {
    if (isAnswered) return;
    setSelectedOption(optId);
    setIsAnswered(true);

    const currentQ = activeQuestions[currentIndex];
    const isCorrect = optId === currentQ.answer;

    // Update local history
    const historyRecord = userData?.history?.[currentQ.id] || { correct: 0, wrong: 0, review: false };
    const updatedRecord = {
      ...historyRecord,
      correct: isCorrect ? (historyRecord.correct || 0) + 1 : (historyRecord.correct || 0),
      wrong: !isCorrect ? (historyRecord.wrong || 0) + 1 : (historyRecord.wrong || 0),
      lastResult: isCorrect
    };

    const newUserData = {
      ...userData,
      history: {
        ...userData?.history,
        [currentQ.id]: updatedRecord
      }
    };
    setUserData(newUserData);

    // Save history & progress to Firestore
    try {
      const docRef = doc(db, APP_ID, secretKey);
      await updateDoc(docRef, {
        [`history.${currentQ.id}`]: updatedRecord,
        progressIndex: currentIndex,
        progressMode: quizMode
      });
    } catch (error) {
      console.error("Error updating answer:", error);
    }
  };

  const toggleReview = async () => {
    const currentQ = activeQuestions[currentIndex];
    const currentReviewState = userData?.history?.[currentQ.id]?.review || false;
    const newReviewState = !currentReviewState;

    const newUserData = {
      ...userData,
      history: {
        ...userData?.history,
        [currentQ.id]: {
          ...(userData?.history?.[currentQ.id] || { correct: 0, wrong: 0 }),
          review: newReviewState
        }
      }
    };
    setUserData(newUserData);

    try {
      const docRef = doc(db, APP_ID, secretKey);
      await updateDoc(docRef, {
        [`history.${currentQ.id}.review`]: newReviewState
      });
    } catch (error) {
      console.error("Error toggling review:", error);
    }
  };

  const nextQuestion = async () => {
    if (currentIndex + 1 < activeQuestions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswered(false);
      await saveProgressToFirestore(nextIdx, quizMode);
    } else {
      // Finished
      await clearProgressFromFirestore();
      setResumeData(null);
      setView('history');
    }
  };

  const goHome = async () => {
    if (view === 'quiz') {
      await saveProgressToFirestore(currentIndex, quizMode);
      setResumeData({ index: currentIndex, mode: quizMode });
    }
    setView('home');
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 1. Login Screen
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">スマート問題集<br/>6-7 契約・法務</h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            合言葉（ユーザーID）を入力してください。<br/>PC・スマホで同じ合言葉を使うと履歴が同期されます。
          </p>
          <input
            type="text"
            className="w-full border-2 border-gray-200 rounded-lg p-3 mb-4 focus:outline-none focus:border-blue-500"
            placeholder="合言葉を入力..."
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            はじめる
          </button>
        </div>
      </div>
    );
  }

  // 2. Home Screen
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-20">
        <header className="max-w-2xl mx-auto flex justify-between items-center mb-8 pt-4">
          <h1 className="text-xl font-bold text-gray-800">スマート問題集</h1>
          <button onClick={() => setView('history')} className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
            <BarChart2 className="w-6 h-6" />
          </button>
        </header>

        <main className="max-w-2xl mx-auto space-y-6">
          {resumeData && resumeData.index !== null && (
            <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-xl shadow-sm">
              <h2 className="font-bold text-yellow-800 flex items-center mb-2">
                <Clock className="w-5 h-5 mr-2" />
                学習の続きから再開できます
              </h2>
              <p className="text-sm text-yellow-700 mb-4">
                前回は【{resumeData.mode === 'all' ? '全て' : resumeData.mode === 'wrong' ? '不正解' : '要復習'}】の{resumeData.index + 1}問目まで進んでいます。
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={resumeQuiz}
                  className="flex-1 bg-yellow-500 text-white font-bold py-2 rounded-lg hover:bg-yellow-600"
                >
                  続きから再開する
                </button>
                <button
                  onClick={async () => {
                    await clearProgressFromFirestore();
                    setResumeData(null);
                  }}
                  className="flex-1 bg-white border border-yellow-300 text-yellow-700 font-bold py-2 rounded-lg hover:bg-yellow-100"
                >
                  リセット
                </button>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">出題モードを選択</h2>
            <div className="space-y-3">
              <button
                onClick={() => { clearProgressFromFirestore(); setResumeData(null); startQuiz('all'); }}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
              >
                <div className="flex items-center text-gray-700 font-bold group-hover:text-blue-700">
                  <BookOpen className="w-5 h-5 mr-3 text-blue-500" />
                  すべての問題 ({quizData.length}問)
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
              </button>

              <button
                onClick={() => { clearProgressFromFirestore(); setResumeData(null); startQuiz('wrong'); }}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg hover:border-red-500 hover:bg-red-50 transition group"
              >
                <div className="flex items-center text-gray-700 font-bold group-hover:text-red-700">
                  <X className="w-5 h-5 mr-3 text-red-500" />
                  前回不正解の問題のみ
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
              </button>

              <button
                onClick={() => { clearProgressFromFirestore(); setResumeData(null); startQuiz('review'); }}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg hover:border-green-500 hover:bg-green-50 transition group"
              >
                <div className="flex items-center text-gray-700 font-bold group-hover:text-green-700">
                  <Save className="w-5 h-5 mr-3 text-green-500" />
                  要復習の問題のみ
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 3. Quiz Screen
  if (view === 'quiz') {
    const currentQ = activeQuestions[currentIndex];
    const isReview = userData?.history?.[currentQ.id]?.review || false;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <button onClick={goHome} className="text-gray-500 hover:text-gray-800 flex items-center">
              <Home className="w-5 h-5 mr-1" /> ホーム
            </button>
            <div className="font-bold text-gray-600">
              {currentIndex + 1} / {activeQuestions.length}
            </div>
          </div>
          <div className="h-1 bg-gray-200">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((currentIndex) / activeQuestions.length) * 100}%` }}
            ></div>
          </div>
        </header>

        <main className="flex-1 max-w-3xl mx-auto w-full p-4 pb-24">
          <div className="mb-6">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mb-2">
              {currentQ.title}
            </span>
            <h2 className="text-lg font-bold text-gray-800 leading-relaxed whitespace-pre-line">
              {currentQ.question}
            </h2>
          </div>

          <div className="space-y-3 mb-8">
            {currentQ.options.map(opt => {
              const isSelected = selectedOption === opt.id;
              const isCorrectOpt = currentQ.answer === opt.id;
              
              let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start";
              let icon = null;

              if (!isAnswered) {
                btnClass += " border-gray-200 hover:border-blue-400 hover:bg-blue-50 bg-white";
              } else {
                if (isCorrectOpt) {
                  btnClass += " border-green-500 bg-green-50";
                  icon = <Check className="w-6 h-6 text-green-500 shrink-0 mt-0.5 ml-2" />;
                } else if (isSelected && !isCorrectOpt) {
                  btnClass += " border-red-500 bg-red-50";
                  icon = <X className="w-6 h-6 text-red-500 shrink-0 mt-0.5 ml-2" />;
                } else {
                  btnClass += " border-gray-200 bg-gray-50 opacity-60";
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleAnswer(opt.id)}
                  disabled={isAnswered}
                  className={btnClass}
                >
                  <span className="font-bold mr-3 text-gray-500 shrink-0">{opt.id}</span>
                  <span className="flex-1 text-gray-800 leading-relaxed">{opt.text}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          {/* Explanation Section */}
          {isAnswered && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-fade-in mb-8">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-800 flex items-center">
                  {selectedOption === currentQ.answer ? (
                    <span className="text-green-600 flex items-center"><Check className="w-6 h-6 mr-1"/> 正解！</span>
                  ) : (
                    <span className="text-red-600 flex items-center"><X className="w-6 h-6 mr-1"/> 不正解... (正解: {currentQ.answer})</span>
                  )}
                </h3>
                
                <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 p-2 rounded hover:bg-gray-100">
                  <input 
                    type="checkbox" 
                    checked={isReview}
                    onChange={toggleReview}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-sm text-gray-700">要復習</span>
                </label>
              </div>

              <div className="prose max-w-none text-gray-800">
                {currentQ.explanation}
              </div>
            </div>
          )}
        </main>

        {isAnswered && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
            <div className="max-w-3xl mx-auto flex justify-end">
              <button
                onClick={nextQuestion}
                className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg flex items-center hover:bg-blue-700 transition"
              >
                {currentIndex + 1 < activeQuestions.length ? '次の問題へ' : '結果を見る'}
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. History / Results Screen
  if (view === 'history') {
    const totalQuestions = quizData.length;
    let correctOnce = 0;
    let reviewCount = 0;

    quizData.forEach(q => {
      const hist = userData?.history?.[q.id];
      if (hist?.correct > 0) correctOnce++;
      if (hist?.review) reviewCount++;
    });

    const pieData = [
      { name: '正解経験あり', value: correctOnce, color: '#3b82f6' },
      { name: '未正解', value: totalQuestions - correctOnce, color: '#e5e7eb' }
    ];

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <header className="max-w-3xl mx-auto flex justify-between items-center mb-8 pt-4">
          <button onClick={goHome} className="text-gray-500 hover:text-gray-800 flex items-center">
            <Home className="w-5 h-5 mr-1" /> ホーム
          </button>
          <h1 className="text-xl font-bold text-gray-800">学習履歴</h1>
        </header>

        <main className="max-w-3xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              <h3 className="text-gray-500 font-bold mb-2">全体の進捗 (1度でも正解)</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{correctOnce} / {totalQuestions}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              <h3 className="text-gray-500 font-bold mb-4">要復習リスト登録数</h3>
              <div className="text-5xl font-extrabold text-orange-500 mb-2">{reviewCount}</div>
              <p className="text-gray-500">問</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-bold text-gray-800">問題別正答状況</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr>
                    <th className="p-4">問題</th>
                    <th className="p-4 text-center">正解</th>
                    <th className="p-4 text-center">不正解</th>
                    <th className="p-4 text-center">要復習</th>
                  </tr>
                </thead>
                <tbody>
                  {quizData.map(q => {
                    const hist = userData?.history?.[q.id];
                    return (
                      <tr key={q.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-bold text-gray-800 mb-1">{q.title}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-green-100 text-green-800 font-bold py-1 px-3 rounded-full">
                            {hist?.correct || 0}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-red-100 text-red-800 font-bold py-1 px-3 rounded-full">
                            {hist?.wrong || 0}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {hist?.review ? (
                            <span className="text-orange-500 font-bold">★</span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}