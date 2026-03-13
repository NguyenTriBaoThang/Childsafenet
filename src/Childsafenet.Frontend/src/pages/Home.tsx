import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Pill } from "../components/Pill";

export default function Home() {
  return (
    <div className="stack">
      <section className="csnSaasHero">
        <div className="csnSaasHeroGlow csnSaasHeroGlow1" />
        <div className="csnSaasHeroGlow csnSaasHeroGlow2" />

        <div className="csnSaasHeroContent">
          <div className="csnSaasHeroLeft">
            <div className="kicker">
              <Pill text="AI Protection" kind="neutral" />
              <Pill text="Parent Dashboard" kind="neutral" />
              <Pill text="Chrome Extension" kind="neutral" />
            </div>

            <h1 className="heroTitle">
              ChildSafeNet
              <span className="grad"> – Giám sát và cảnh báo rủi ro Internet cho trẻ em</span>
            </h1>

            <p className="heroSub">
              Một nền tảng hỗ trợ phụ huynh theo dõi website trẻ đang truy cập,
              phát hiện nội dung nguy hiểm hoặc không phù hợp, và đưa ra hành động
              <b> ALLOW</b>, <b>WARN</b>, hoặc <b>BLOCK</b> dựa trên AI kết hợp với
              cài đặt an toàn của gia đình.
            </p>

            <div className="heroActions">
              <Link to="/login">
                <Button>Bắt đầu với tài khoản phụ huynh</Button>
              </Link>

              <Link to="/scan">
                <Button variant="ghost">Kiểm tra website thủ công</Button>
              </Link>
            </div>

            <div className="csnHeroStats">
              <div className="csnHeroStat">
                <div className="csnHeroStatValue">AI + Rules</div>
                <div className="csnHeroStatLabel">Kết hợp AI và luật bảo vệ</div>
              </div>
              <div className="csnHeroStat">
                <div className="csnHeroStatValue">Parent-first</div>
                <div className="csnHeroStatLabel">Thiết kế ưu tiên phụ huynh</div>
              </div>
              <div className="csnHeroStat">
                <div className="csnHeroStatValue">Real-time</div>
                <div className="csnHeroStatLabel">Theo dõi và cảnh báo gần thời gian thực</div>
              </div>
            </div>
          </div>

          <div className="csnSaasHeroRight">
            <div className="csnSaasPreviewShell">
              <div className="csnSaasPreviewTop">
                <div className="csnBrowserDots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="csnPreviewUrlBar">childsafenet://dashboard/parent-overview</div>
              </div>

              <div className="csnSaasPreviewBody">
                <div className="csnPreviewSidebar">
                  <div className="csnPreviewSidebarBrand">ChildSafeNet</div>
                  <div className="csnPreviewSidebarItem active">Dashboard</div>
                  <div className="csnPreviewSidebarItem">Manual Scan</div>
                  <div className="csnPreviewSidebarItem">Settings</div>
                  <div className="csnPreviewSidebarItem">Extension</div>
                </div>

                <div className="csnPreviewMain">
                  <div className="csnPreviewBanner">
                    <div>
                      <div className="csnPreviewBannerTitle">Internet Safety Overview</div>
                      <div className="csnPreviewBannerText">
                        Theo dõi website trẻ truy cập và phát hiện rủi ro dễ hiểu hơn cho phụ huynh.
                      </div>
                    </div>
                    <Pill text="READY • ON" kind="ok" />
                  </div>

                  <div className="csnPreviewCards">
                    <div className="csnPreviewMetricCard">
                      <div className="csnPreviewMetricLabel">Allowed</div>
                      <div className="csnPreviewMetricValue">128</div>
                    </div>
                    <div className="csnPreviewMetricCard">
                      <div className="csnPreviewMetricLabel">Warning</div>
                      <div className="csnPreviewMetricValue">9</div>
                    </div>
                    <div className="csnPreviewMetricCard">
                      <div className="csnPreviewMetricLabel">Blocked</div>
                      <div className="csnPreviewMetricValue">14</div>
                    </div>
                  </div>

                  <div className="csnPreviewPanel">
                    <div className="csnPreviewPanelTitle">Recent Protection Logs</div>

                    <div className="csnPreviewTable">
                      <div className="csnPreviewRow">
                        <div className="csnPreviewSite">
                          <div className="csnPreviewSiteTitle">google.com</div>
                          <div className="csnPreviewSiteSub">Website phổ thông</div>
                        </div>
                        <span className="csnMiniBadge ok">ALLOW</span>
                      </div>

                      <div className="csnPreviewRow">
                        <div className="csnPreviewSite">
                          <div className="csnPreviewSiteTitle">unknown-bet-site.com</div>
                          <div className="csnPreviewSiteSub">Website cá cược đáng ngờ</div>
                        </div>
                        <span className="csnMiniBadge bad">BLOCK</span>
                      </div>

                      <div className="csnPreviewRow">
                        <div className="csnPreviewSite">
                          <div className="csnPreviewSiteTitle">new-random-site.net</div>
                          <div className="csnPreviewSiteSub">Cần phụ huynh xem lại</div>
                        </div>
                        <span className="csnMiniBadge warn">WARN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="csnTrustStrip">
        <div className="csnTrustItem">Bảo vệ trẻ khi truy cập web</div>
        <div className="csnTrustDivider" />
        <div className="csnTrustItem">Giải thích rõ cho phụ huynh</div>
        <div className="csnTrustDivider" />
        <div className="csnTrustItem">Cho phép chặn thủ công</div>
        <div className="csnTrustDivider" />
        <div className="csnTrustItem">Tùy chỉnh theo độ tuổi</div>
      </section>

      <section className="csnFeatureGrid">
        <Card className="csnFeatureCard">
          <div className="csnFeatureIcon">🛡️</div>
          <div className="cardTitle">Bảo vệ chủ động</div>
          <div className="cardText">
            Phát hiện website có rủi ro như giả mạo, độc hại, nội dung người lớn
            hoặc các website đáng ngờ trước khi trẻ truy cập sâu hơn.
          </div>
        </Card>

        <Card className="csnFeatureCard">
          <div className="csnFeatureIcon">👨‍👩‍👧</div>
          <div className="cardTitle">Thiết kế dành cho phụ huynh</div>
          <div className="cardText">
            Kết quả được giải thích dễ hiểu: website đang an toàn, cần cảnh báo,
            hay nên bị chặn, thay vì chỉ hiển thị dữ liệu kỹ thuật khó đọc.
          </div>
        </Card>

        <Card className="csnFeatureCard">
          <div className="csnFeatureIcon">⚙️</div>
          <div className="cardTitle">Tùy chỉnh linh hoạt</div>
          <div className="cardText">
            Phụ huynh có thể chọn mức bảo vệ, bật/tắt các nhóm chặn, và quản lý
            danh sách luôn cho phép hoặc luôn chặn.
          </div>
        </Card>
      </section>

      <section className="csnSaasSection">
        <div className="csnSectionLead">
          <div className="kicker">
            <Pill text="How it works" kind="neutral" />
          </div>
          <h2 className="h2">Cách ChildSafeNet hoạt động trong thực tế</h2>
          <div className="muted">
            Hệ thống được thiết kế để vừa tự động hỗ trợ bảo vệ, vừa giữ quyền
            quyết định cuối cùng cho phụ huynh.
          </div>
        </div>

        <div className="csnTimeline">
          <Card className="csnTimelineCard">
            <div className="csnTimelineNo">01</div>
            <div className="cardTitle">Ghi nhận website đang truy cập</div>
            <div className="cardText">
              Extension hoặc hệ thống web ghi nhận URL, tiêu đề trang và các tín
              hiệu cơ bản từ website mà trẻ đang truy cập.
            </div>
          </Card>

          <Card className="csnTimelineCard">
            <div className="csnTimelineNo">02</div>
            <div className="cardTitle">AI và luật an toàn cùng đánh giá</div>
            <div className="cardText">
              AI phân loại website theo mức rủi ro, sau đó hệ thống áp dụng thêm
              các cài đặt mà phụ huynh đã thiết lập như độ tuổi, whitelist và blacklist.
            </div>
          </Card>

          <Card className="csnTimelineCard">
            <div className="csnTimelineNo">03</div>
            <div className="cardTitle">Hiển thị kết quả rõ ràng cho phụ huynh</div>
            <div className="cardText">
              Dashboard trình bày kết quả theo cách dễ hiểu để phụ huynh biết
              website đó có an toàn không và nên xử lý như thế nào.
            </div>
          </Card>
        </div>
      </section>

      <section className="csnSplitShowcase">
        <Card className="csnShowcaseCard">
          <div className="csnShowcaseKicker">Parent Dashboard</div>
          <div className="cardTitle">Theo dõi và quản lý tại một nơi duy nhất</div>
          <div className="cardText">
            Dashboard giúp phụ huynh xem lịch sử truy cập, hành động ALLOW / WARN /
            BLOCK, trạng thái extension, và các website đang bị chặn thủ công.
          </div>

          <ul className="csnShowcaseList">
            <li>Xem lại website trẻ đã truy cập</li>
            <li>Hiểu vì sao website bị cảnh báo hoặc chặn</li>
            <li>Block / Unblock website thủ công</li>
            <li>Tinh chỉnh mức bảo vệ theo nhu cầu gia đình</li>
          </ul>
        </Card>

        <Card className="csnShowcaseCard">
          <div className="csnShowcaseKicker">Manual Scan</div>
          <div className="cardTitle">Kiểm tra website trước khi cho trẻ truy cập</div>
          <div className="cardText">
            Phụ huynh có thể nhập một website để xem website đó nói về gì, mức
            độ an toàn, loại nội dung, và liệu có nên chặn hay không.
          </div>

          <ul className="csnShowcaseList">
            <li>Hiển thị nội dung website theo cách dễ hiểu</li>
            <li>Giải thích mức độ an toàn cho phụ huynh</li>
            <li>Cho phép chặn website ngay tại màn hình kiểm tra</li>
            <li>Giảm phụ thuộc vào phán đoán cảm tính</li>
          </ul>
        </Card>
      </section>

      <section className="csnBenefitBand">
        <div className="csnBenefitBandLeft">
          <div className="kicker">
            <Pill text="Benefits" kind="neutral" />
          </div>
          <h2 className="h2">Lợi ích thực tế cho gia đình</h2>
          <p className="muted">
            ChildSafeNet không chỉ phát hiện rủi ro, mà còn giúp phụ huynh hiểu
            rõ và quản lý việc truy cập Internet của trẻ một cách chủ động hơn.
          </p>
        </div>

        <div className="csnBenefitBandRight">
          <div className="csnBenefitItem">
            <div className="csnBenefitItemTitle">Dễ dùng hơn</div>
            <div className="cardText">
              Giao diện được thiết kế để phụ huynh có thể đọc và hiểu nhanh.
            </div>
          </div>

          <div className="csnBenefitItem">
            <div className="csnBenefitItemTitle">An tâm hơn</div>
            <div className="cardText">
              Trẻ được bảo vệ trước các website nguy hiểm hoặc không phù hợp.
            </div>
          </div>

          <div className="csnBenefitItem">
            <div className="csnBenefitItemTitle">Chủ động hơn</div>
            <div className="cardText">
              Quyền quyết định cuối cùng vẫn thuộc về phụ huynh, không hoàn toàn phụ thuộc AI.
            </div>
          </div>
        </div>
      </section>

      <section className="csnBigCta">
        <Card className="csnBigCtaCard">
          <div className="csnBigCtaText">
            <div className="csnBigCtaKicker">Ready to start?</div>
            <div className="csnBigCtaTitle">
              Bắt đầu thiết lập môi trường Internet an toàn hơn cho trẻ
            </div>
            <div className="cardText">
              Đăng nhập để vào dashboard phụ huynh, hoặc thử kiểm tra một website
              thủ công trước khi quyết định cho trẻ truy cập.
            </div>
          </div>

          <div className="heroActions">
            <Link to="/login">
              <Button>Đăng nhập</Button>
            </Link>
            <Link to="/scan">
              <Button variant="ghost">Thử Manual Scan</Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}