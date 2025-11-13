/**
 * Data Module - Embedded data (no fetch required for file:// protocol)
 */

const DataManager = {
  countries: [],
  events: [],
  leaders: [],
  countryById: {},
  eventsByYear: {},
  eventsByType: {},
  
  /**
   * Load all data (now embedded directly)
   */
  async loadAll() {
    try {
      // Embed data directly to avoid CORS issues with file:// protocol
      this.countries = [
        {"id":"DE","name":"Germany","side":"Axis","joined":"1939-09-01","notes":"Nazi Germany initiated WWII by invading Poland. Led aggressive expansion across Europe until defeated in 1945.","leaders":["Adolf Hitler","Hermann Göring"],"relatedEvents":["poland_1939","france_1940","barbarossa_1941","stalingrad_1942","surrender_1945"],"casualties":"6-7 million military, 1-2 million civilian"},
        {"id":"US","name":"United States","side":"Allies","joined":"1941-12-07","notes":"Entered after Pearl Harbor. Became 'Arsenal of Democracy' with massive industrial production. Led Pacific and Western European campaigns.","leaders":["Franklin D. Roosevelt","Harry S. Truman","Dwight D. Eisenhower"],"relatedEvents":["pearl_1941","midway_1942","dday_1944","atomic_1945","vj_1945"],"casualties":"416,800 military deaths"},
        {"id":"UK","name":"United Kingdom","side":"Allies","joined":"1939-09-03","notes":"Declared war on Germany after Poland invasion. Stood alone against Axis 1940-1941. Critical role in intelligence and North Africa.","leaders":["Winston Churchill","Bernard Montgomery"],"relatedEvents":["war_declaration_1939","battle_britain_1940","el_alamein_1942","dday_1944"],"casualties":"450,000 total deaths"},
        {"id":"SU","name":"Soviet Union","side":"Allies","joined":"1941-06-22","notes":"Bore brunt of Nazi aggression on Eastern Front. Suffered highest casualties but played decisive role in defeating Germany.","leaders":["Joseph Stalin","Georgy Zhukov"],"relatedEvents":["barbarossa_1941","stalingrad_1942","kursk_1943","berlin_1945"],"casualties":"27 million total deaths"},
        {"id":"JP","name":"Japan","side":"Axis","joined":"1940-09-27","notes":"Pursued aggressive expansion in Asia-Pacific. Attack on Pearl Harbor brought US into war. Surrendered after atomic bombings.","leaders":["Emperor Hirohito","Hideki Tojo"],"relatedEvents":["pearl_1941","midway_1942","atomic_1945","vj_1945"],"casualties":"3.1 million total deaths"},
        {"id":"FR","name":"France","side":"Allies","joined":"1939-09-03","notes":"Declared war on Germany but fell in June 1940. Free French forces and Resistance continued fight. Liberated in 1944.","leaders":["Charles de Gaulle","Philippe Pétain"],"relatedEvents":["war_declaration_1939","france_1940","paris_1944"],"casualties":"600,000 total deaths"},
        {"id":"IT","name":"Italy","side":"Axis","joined":"1940-06-10","notes":"Under Mussolini, joined Germany. Suffered defeats in North Africa and Greece. Surrendered 1943 and switched sides.","leaders":["Benito Mussolini","Victor Emmanuel III"],"relatedEvents":["italy_entry_1940","italy_surrender_1943"],"casualties":"500,000 total deaths"},
        {"id":"CN","name":"China","side":"Allies","joined":"1937-07-07","notes":"Fought Japan from 1937. Second Sino-Japanese War merged into WWII. Tied down massive Japanese forces throughout war.","leaders":["Chiang Kai-shek","Mao Zedong"],"relatedEvents":["china_japan_1937"],"casualties":"15-20 million total deaths"},
        {"id":"CA","name":"Canada","side":"Allies","joined":"1939-09-10","notes":"Significant contributions to Allied war effort. Participated in major European campaigns. Over 1 million served.","leaders":["William Lyon Mackenzie King"],"relatedEvents":["dday_1944"],"casualties":"45,000 military deaths"},
        {"id":"AU","name":"Australia","side":"Allies","joined":"1939-09-03","notes":"Entered alongside Britain. Crucial role in Pacific Theater defending against Japanese expansion.","leaders":["John Curtin"],"relatedEvents":["pearl_1941"],"casualties":"40,000 total deaths"},
        {"id":"PL","name":"Poland","side":"Allies","joined":"1939-09-01","notes":"Invasion sparked WWII. Despite occupation, Polish forces fought on all fronts through government-in-exile.","leaders":["Władysław Sikorski"],"relatedEvents":["poland_1939"],"casualties":"6 million total deaths (17% of population)"},
        {"id":"ES","name":"Spain","side":"Neutral","joined":null,"notes":"Officially neutral under Franco's fascist regime, though sympathized with Axis. Avoided direct participation.","leaders":["Francisco Franco"],"relatedEvents":[],"casualties":"Neutral - no major WWII casualties"},
        {"id":"SE","name":"Sweden","side":"Neutral","joined":null,"notes":"Maintained armed neutrality. Traded with both sides. Provided humanitarian refuge including Danish Jews.","leaders":["Gustaf V"],"relatedEvents":[],"casualties":"Neutral - no major WWII casualties"},
        {"id":"BR","name":"Brazil","side":"Allies","joined":"1942-08-22","notes":"Only South American nation to send combat troops. Brazilian Expeditionary Force fought in Italy.","leaders":["Getúlio Vargas"],"relatedEvents":[],"casualties":"2,000 military deaths"}
      ];
      
      this.events = [
        {"id":"poland_1939","year":1939,"date":"1939-09-01","title":"Invasion of Poland","type":"Major Event","summary":"Germany invades Poland using Blitzkrieg tactics, marking the official start of WWII in Europe. Britain and France declare war on Germany two days later.","countries":["DE","PL","UK","FR"],"facts":["First use of coordinated tank and air attacks (Blitzkrieg)","Soviet Union invaded from east on September 17","Poland surrendered October 6, 1939","1.5 million German troops invaded"]},
        {"id":"war_declaration_1939","year":1939,"date":"1939-09-03","title":"Britain & France Declare War","type":"Major Event","summary":"Following Germany's invasion of Poland, Britain and France honor their alliance commitments and declare war on Germany.","countries":["UK","FR","DE"],"facts":["Declarations came 2 days after invasion","Started the 'Phoney War' period","Australia, New Zealand also declared war"]},
        {"id":"france_1940","year":1940,"date":"1940-06-22","title":"Fall of France","type":"Major Event","summary":"France surrenders to Germany after just 6 weeks of fighting. The Vichy government is established in unoccupied southern France.","countries":["FR","DE","UK"],"facts":["France fell in 6 weeks","Dunkirk evacuation saved 338,000 Allied troops","Vichy collaboration government established","Free French forces continued fight under de Gaulle"]},
        {"id":"battle_britain_1940","year":1940,"date":"1940-07-10","title":"Battle of Britain","type":"Battle","summary":"The RAF successfully defends Britain against sustained German Luftwaffe attacks, preventing invasion and marking Hitler's first major defeat.","countries":["UK","DE"],"facts":["First major military campaign fought entirely by air forces","RAF shot down 1,887 German aircraft","Prevented Operation Sea Lion (German invasion)","Churchill: 'Never was so much owed by so many to so few'"]},
        {"id":"barbarossa_1941","year":1941,"date":"1941-06-22","title":"Operation Barbarossa","type":"Battle","summary":"Germany launches massive invasion of Soviet Union, opening the Eastern Front. Largest military operation in history.","countries":["DE","SU"],"facts":["3.8 million Axis troops invaded","Largest land operation in history","Broke Nazi-Soviet Pact","Eventually led to German defeat"]},
        {"id":"pearl_1941","year":1941,"date":"1941-12-07","title":"Attack on Pearl Harbor","type":"Major Event","summary":"Japan launches surprise attack on US naval base at Pearl Harbor, Hawaii. Brings United States into WWII.","countries":["JP","US"],"facts":["353 Japanese aircraft attacked in two waves","8 US battleships damaged or destroyed","2,403 Americans killed","Roosevelt: 'A date which will live in infamy'","US declared war on Japan December 8"]},
        {"id":"midway_1942","year":1942,"date":"1942-06-04","title":"Battle of Midway","type":"Battle","summary":"US Navy defeats Japan in decisive Pacific battle, crippling Japanese carrier fleet and shifting Pacific War momentum.","countries":["US","JP"],"facts":["US codebreakers gave crucial advantage","4 Japanese carriers sunk in one day","Japan never recovered carrier strength","Turning point in Pacific War"]},
        {"id":"stalingrad_1942","year":1942,"date":"1942-08-23","title":"Battle of Stalingrad","type":"Battle","summary":"Brutal urban warfare as Soviet forces halt German advance. Turning point on Eastern Front with massive casualties on both sides.","countries":["SU","DE"],"facts":["Lasted 5 months (Aug 1942 - Feb 1943)","Close-quarters urban combat","2 million total casualties","German 6th Army surrounded and destroyed","Major turning point of WWII"]},
        {"id":"el_alamein_1942","year":1942,"date":"1942-10-23","title":"Battle of El Alamein","type":"Battle","summary":"British victory in North Africa turns tide against Axis forces, beginning long retreat from Africa.","countries":["UK","DE","IT"],"facts":["Montgomery defeated Rommel","Marked beginning of Axis retreat in Africa","Churchill: 'Not the end, not even the beginning of the end, but perhaps the end of the beginning'"]},
        {"id":"stalingrad_victory_1943","year":1943,"date":"1943-02-02","title":"German Surrender at Stalingrad","type":"Major Event","summary":"Complete Soviet victory marks major turning point. German 6th Army destroyed, devastating Nazi war machine.","countries":["SU","DE"],"facts":["91,000 Germans captured","Ended Hitler's eastern advance","Soviet morale soared","Beginning of German retreat"]},
        {"id":"kursk_1943","year":1943,"date":"1943-07-05","title":"Battle of Kursk","type":"Battle","summary":"Largest tank battle in history. Soviet victory ends German offensive capability on Eastern Front.","countries":["SU","DE"],"facts":["6,000+ tanks involved","Largest tank battle in history","Germany lost offensive initiative permanently","Soviet advantage continued until Berlin"]},
        {"id":"italy_surrender_1943","year":1943,"date":"1943-09-08","title":"Italy Surrenders","type":"Major Event","summary":"Italy surrenders unconditionally and switches to Allied side after invasion of Sicily and mainland.","countries":["IT","US","UK"],"facts":["Mussolini deposed and arrested","Italy switched to Allies","Germans occupied northern Italy","Italian Civil War followed"]},
        {"id":"dday_1944","year":1944,"date":"1944-06-06","title":"D-Day (Operation Overlord)","type":"Major Event","summary":"Massive Allied amphibious invasion of Normandy opens Western Front. Largest seaborne invasion in history.","countries":["US","UK","CA","FR","DE"],"facts":["156,000 troops landed on D-Day","5 beach landing zones: Utah, Omaha, Gold, Juno, Sword","Airborne drops behind enemy lines","5,000+ ships, 11,000+ aircraft","10,000 Allied casualties first day","Beginning of the end for Nazi Germany"]},
        {"id":"paris_1944","year":1944,"date":"1944-08-25","title":"Liberation of Paris","type":"Major Event","summary":"Allied forces liberate Paris from four years of German occupation. Free French forces lead entry into city.","countries":["FR","US","DE"],"facts":["Free French 2nd Armored Division led liberation","Hitler ordered city destroyed, order not followed","De Gaulle returned triumphantly","Symbolic victory for Allies"]},
        {"id":"bulge_1944","year":1944,"date":"1944-12-16","title":"Battle of the Bulge","type":"Battle","summary":"Germany's last major offensive in the West. Surprise attack creates 'bulge' in Allied lines before being repelled.","countries":["DE","US","UK"],"facts":["Largest battle fought by US Army","19,000 American soldiers killed","Last major German offensive","Depleted German reserves"]},
        {"id":"yalta_1945","year":1945,"date":"1945-02-04","title":"Yalta Conference","type":"Leader","summary":"Roosevelt, Churchill, and Stalin meet to plan post-war Europe and final assault on Germany.","countries":["US","UK","SU"],"facts":["The 'Big Three' met in Crimea","Planned division of Germany","Soviet entry into Pacific War agreed","Foundation for United Nations"]},
        {"id":"berlin_1945","year":1945,"date":"1945-04-16","title":"Battle of Berlin","type":"Battle","summary":"Final major European battle. Soviet forces capture Berlin after intense urban combat.","countries":["SU","DE"],"facts":["2.5 million Soviet troops attacked","Intense house-to-house fighting","Hitler committed suicide April 30","Reichstag captured May 2"]},
        {"id":"surrender_1945","year":1945,"date":"1945-05-08","title":"V-E Day (Victory in Europe)","type":"Major Event","summary":"Germany surrenders unconditionally, ending WWII in Europe after six years of devastating conflict.","countries":["DE","US","UK","SU","FR"],"facts":["Celebrated May 8 in West, May 9 in Soviet Union","40-50 million European deaths","6 million Jews killed in Holocaust","War in Pacific continued"]},
        {"id":"atomic_1945","year":1945,"date":"1945-08-06","title":"Atomic Bombs Dropped","type":"Major Event","summary":"USA drops atomic bombs on Hiroshima (Aug 6) and Nagasaki (Aug 9), ushering in atomic age.","countries":["US","JP"],"facts":["Hiroshima: 70,000+ killed instantly","Nagasaki: 40,000+ killed instantly","Total deaths: 200,000+ by end of 1945","First and only combat use of nuclear weapons","Forced Japanese surrender"]},
        {"id":"vj_1945","year":1945,"date":"1945-08-15","title":"V-J Day (Victory over Japan)","type":"Major Event","summary":"Japan announces surrender, ending WWII. Formal ceremony held September 2 aboard USS Missouri.","countries":["JP","US","UK","SU","CN"],"facts":["Emperor Hirohito announced surrender via radio","Formal surrender signed September 2, 1945","WWII officially ended","70-85 million total deaths worldwide","Reshaped global order and led to Cold War"]}
      ];
      
      this.leaders = [
        {"name":"Winston Churchill","country":"UK","role":"Prime Minister","years":"1940–1945","bio":"Led Britain through its darkest hour. Famous for inspiring speeches and determination to never surrender."},
        {"name":"Franklin D. Roosevelt","country":"US","role":"President","years":"1933–1945","bio":"Led US through Great Depression and WWII. Died in office April 1945, weeks before victory."},
        {"name":"Harry S. Truman","country":"US","role":"President","years":"1945","bio":"Became president upon FDR's death. Made decision to use atomic bombs."},
        {"name":"Joseph Stalin","country":"SU","role":"General Secretary","years":"1922–1953","bio":"Led Soviet Union through Great Patriotic War. Suffered highest casualties but played decisive role in defeating Germany."},
        {"name":"Adolf Hitler","country":"DE","role":"Führer","years":"1934–1945","bio":"Nazi dictator who initiated WWII. Committed suicide in Berlin bunker April 30, 1945."},
        {"name":"Benito Mussolini","country":"IT","role":"Il Duce","years":"1922–1943","bio":"Fascist dictator who led Italy into WWII. Deposed 1943, executed by partisans 1945."},
        {"name":"Emperor Hirohito","country":"JP","role":"Emperor","years":"1926–1989","bio":"Japanese emperor during WWII. Announced surrender August 15, 1945 via radio broadcast."},
        {"name":"Charles de Gaulle","country":"FR","role":"Leader of Free France","years":"1940–1944","bio":"Led Free French forces from exile. Returned triumphantly to liberated Paris."}
      ];
      
      this.buildIndexes();
      return true;
    } catch (error) {
      console.error('Error loading data:', error);
      return false;
    }
  },
  
  /**
   * Build lookup indexes for fast access
   */
  buildIndexes() {
    // Index countries by ID
    this.countryById = this.countries.reduce((acc, country) => {
      acc[country.id] = country;
      return acc;
    }, {});
    
    // Index events by year
    this.eventsByYear = this.events.reduce((acc, event) => {
      if (!acc[event.year]) acc[event.year] = [];
      acc[event.year].push(event);
      return acc;
    }, {});
    
    // Index events by type
    this.eventsByType = this.events.reduce((acc, event) => {
      const type = event.type.toLowerCase().replace(/\s+/g, '-');
      if (!acc[type]) acc[type] = [];
      acc[type].push(event);
      return acc;
    }, {});
    
    // Sort events within each year by date
    Object.keys(this.eventsByYear).forEach(year => {
      this.eventsByYear[year].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
    });
  },
  
  /**
   * Get country by ID
   */
  getCountry(id) {
    return this.countryById[id] || null;
  },
  
  /**
   * Get events for a specific year
   */
  getEventsByYear(year) {
    return this.eventsByYear[year] || [];
  },
  
  /**
   * Get events by type
   */
  getEventsByType(type) {
    const normalizedType = type.toLowerCase().replace(/\s+/g, '-');
    return this.eventsByType[normalizedType] || [];
  },
  
  /**
   * Search countries by name
   */
  searchCountries(query) {
    const lowerQuery = query.toLowerCase();
    return this.countries.filter(country => 
      country.name.toLowerCase().includes(lowerQuery) ||
      country.id.toLowerCase().includes(lowerQuery)
    );
  },
  
  /**
   * Get events related to a country
   */
  getCountryEvents(countryId) {
    return this.events.filter(event => 
      event.countries.includes(countryId)
    );
  },
  
  /**
   * Get countries involved in an event
   */
  getEventCountries(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return [];
    
    return event.countries
      .map(id => this.getCountry(id))
      .filter(Boolean);
  },
  
  /**
   * Get leaders for a country
   */
  getCountryLeaders(countryId) {
    const country = this.getCountry(countryId);
    if (!country) return [];
    
    return this.leaders.filter(leader => 
      country.leaders.includes(leader.name)
    );
  },
  
  /**
   * Get all years with events
   */
  getYears() {
    return Object.keys(this.eventsByYear).map(Number).sort();
  },
  
  /**
   * Get event types
   */
  getEventTypes() {
    return [...new Set(this.events.map(e => e.type))];
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataManager;
}
