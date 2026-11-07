export default function StoryReelSection() {
  return (
    <section className="story-reel" id="story-reel" aria-label="A day on the coast, in three moments">
      <div className="story-scroll-track" id="story-scroll-track">
        <div className="story-pin">
          <div className="story-heading">
            <span className="story-kicker">
              <i></i> A DAY, IN THREE MOMENTS
            </span>
            <span className="story-instruction">
              KEEP SCROLLING <b aria-hidden="true">↓</b>
            </span>
          </div>
          <div className="story-scenes" id="story-scenes">
            <article
              className="story-scene scene-one"
              data-reel-scene="0"
              aria-hidden="false"
            >
              <div className="scene-photo scene-photo-one" role="img" aria-label="Atmospheric stock image of waves" />
              <div className="scene-shade" />
              <div className="scene-index">
                01 <i></i> 03
              </div>
              <div className="scene-copy">
                <span>START WITH THE SEA</span>
                <h2>
                  Take the<br />
                  long way <em>to shore.</em>
                </h2>
                <p>
                  Let the morning breathe. Find a quieter stretch of coast before the day gathers
                  pace.
                </p>
                <a
                  className="scene-link magnetic"
                  href="#discover"
                  data-cursor-label="FIND A BEACH"
                >
                  FIND YOUR FIRST STOP <b aria-hidden="true">↗</b>
                </a>
              </div>
              <div className="scene-coordinates">
                12°52′ N&nbsp; · &nbsp;74°50′ E
              </div>
              <span className="scene-photo-note">
                ATMOSPHERIC STOCK IMAGE · NOT A VERIFIED DESTINATION VIEW
              </span>
            </article>
            <article
              className="story-scene scene-two"
              data-reel-scene="1"
              aria-hidden="true"
            >
              <div className="scene-photo scene-photo-two" role="img" aria-label="Atmospheric stock image of a green forest path" />
              <div className="scene-shade" />
              <div className="scene-index">
                02 <i></i> 03
              </div>
              <div className="scene-copy">
                <span>FOLLOW THE GREEN</span>
                <h2>
                  Leave room<br />
                  for the <em>in-between.</em>
                </h2>
                <p>
                  Trade the straight line for a shaded path, a temple courtyard, or a place you did
                  not plan to find.
                </p>
                <a
                  className="scene-link magnetic"
                  href="#discover"
                  tabIndex={-1}
                  data-cursor-label="FIND A HIDDEN GEM"
                >
                  FIND A LOCAL FAVOURITE <b aria-hidden="true">↗</b>
                </a>
              </div>
              <div className="scene-coordinates">
                COASTAL KARNATAKA&nbsp; · &nbsp;SLOW DOWN
              </div>
              <span className="scene-photo-note">
                ATMOSPHERIC STOCK IMAGE · NOT A VERIFIED DESTINATION VIEW
              </span>
            </article>
            <article
              className="story-scene scene-three"
              data-reel-scene="2"
              aria-hidden="true"
            >
              <div className="scene-photo scene-photo-three" role="img" aria-label="Atmospheric stock image of a late afternoon on the coast" />
              <div className="scene-shade" />
              <div className="scene-index">
                03 <i></i> 03
              </div>
              <div className="scene-copy">
                <span>END WHERE YOU LIKE</span>
                <h2>
                  Stay for<br />
                  the <em>last light.</em>
                </h2>
                <p>
                  Put the day in an order that feels right, then leave a little space for the happy
                  detour.
                </p>
                <a
                  className="scene-link magnetic"
                  href="#planner"
                  tabIndex={-1}
                  data-cursor-label="MAKE A DAY PLAN"
                >
                  SHAPE YOUR DAY <b aria-hidden="true">↗</b>
                </a>
              </div>
              <div className="scene-coordinates">
                YOUR COAST, YOUR OWN PACE
              </div>
              <span className="scene-photo-note">
                ATMOSPHERIC STOCK IMAGE · NOT A VERIFIED DESTINATION VIEW
              </span>
            </article>
            <div className="story-orbit orbit-a" aria-hidden="true" />
            <div className="story-orbit orbit-b" aria-hidden="true" />
          </div>
          <div className="story-footer">
            <span id="story-caption">A little salt air to begin.</span>
            <div
              className="story-progress"
              role="progressbar"
              aria-label="Story progress"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="0"
            >
              <span className="story-progress-fill" id="story-progress-fill"></span>
            </div>
            <span className="story-step" id="story-step">
              01 / 03
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
