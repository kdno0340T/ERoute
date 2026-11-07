export default function SeasonalSection() {
  return (
    <section
      className="seasonal-band content-width"
      aria-labelledby="seasonal-title"
    >
      <div className="seasonal-graphic" aria-hidden="true">
        <span className="sun-ring"></span>
        <span className="seasonal-wave wave-one"></span>
        <span className="seasonal-wave wave-two"></span>
        <span className="seasonal-number">06</span>
      </div>
      <div className="seasonal-content">
        <div className="eyebrow">
          <span className="eyebrow-line"></span> KEEP AN EYE ON THE SEASON
        </div>
        <h2 id="seasonal-title">
          The monsoon<br /> has its <em>own map.</em>
        </h2>
        <p>
          Waterfalls and greener trails can be beautiful after the rains. Conditions and access
          change, so check local advisories before setting out.
        </p>
        <span className="seasonal-tag">
          SEASONAL INSPIRATION <i></i> CHECK ACCESS LOCALLY
        </span>
      </div>
      <div className="seasonal-image" role="img" aria-label="Rain clouds gathering over a lush coastal hillside" />
    </section>
  );
}
