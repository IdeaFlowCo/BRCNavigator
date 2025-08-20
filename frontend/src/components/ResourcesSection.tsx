import React from "react";
import { Backpack, Map, CookingPot, Tent, Wrench } from "lucide-react";

interface ResourceLink {
    text: string;
    url: string;
}

interface ResourceItem {
    title: string;
    description: string;
    url?: string; // Optional for backward compatibility
    links?: ResourceLink[]; // Optional array of links
    Icon: React.ElementType;
}

const resources: ResourceItem[] = [
    {
        title: "Burning Man Packing Lists",
        description: "Essential items to bring to the playa",
        links: [
            {
                text: "List 1",
                url: "https://docs.google.com/document/d/1KL__X9aNPQom54wifFTBCNhzwG4v_ZxmFBerSuXc_Uw/edit?tab=t.0#heading=h.edwibwrpdox1"
            },
            {
                text: "List 2",
                url: "https://docs.google.com/spreadsheets/d/1t2KvCRFsTvoLiFeo9ewsCgPUFzfgo0Re3AgDq05AdlU/edit?usp=sharing"
            }
        ],
        Icon: Backpack,
    },
    {
        title: "BurnerMap",
        description: "Find your pals on the playa",
        url: "https://www.burnermap.com/welcome",
        Icon: Map,
    },
    {
        title: "FoodsList",
        description: "Plan your meals for the burn",
        url: "https://foodslist.jacobcole.net/",
        Icon: CookingPot,
    },
    {
        title: "Quality Products",
        description: "Recommended gear for Burning Man",
        url: "https://docs.google.com/document/d/1LAao0_9G2e5QhIP_4RSH7rmu2AUxGzuRdj1xf7NmIa0/edit?tab=t.0",
        Icon: Tent,
    },
    {
        title: "Burning Man Issue Tracker",
        description: "Community-sourced solutions for common playa problems",
        url: "https://docs.google.com/document/d/1J2s35Fd2cpXPvs8VWIq6LFLMNVurCyXRk94uaCLbvoA/edit?tab=t.0#heading=h.fmrpavgg0t70",
        Icon: Wrench,
    },
];

const ResourcesSection: React.FC = () => {
    return (
        <section className="resources-section">
            <h2 className="resources-title">Burning Man Resources</h2>
            <div className="resources-list">
                {resources.map((resource) => {
                    // If it has multiple links, render as a div with internal links
                    if (resource.links) {
                        return (
                            <div key={resource.title} className="resource-card">
                                <div className="resource-icon-wrapper">
                                    <resource.Icon size={32} strokeWidth={1.5} />
                                </div>
                                <div className="resource-text">
                                    <h3>{resource.title}</h3>
                                    <p>{resource.description}</p>
                                    <div className="resource-links">
                                        {resource.links.map((link, index) => (
                                            <React.Fragment key={link.text}>
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="resource-link"
                                                >
                                                    {link.text}
                                                </a>
                                                {index < resource.links!.length - 1 && (
                                                    <span className="link-separator"> • </span>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    // Otherwise render as before (single link)
                    return (
                        <a
                            key={resource.title}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="resource-card"
                        >
                            <div className="resource-icon-wrapper">
                                <resource.Icon size={32} strokeWidth={1.5} />
                            </div>
                            <div className="resource-text">
                                <h3>{resource.title}</h3>
                                <p>{resource.description}</p>
                            </div>
                        </a>
                    );
                })}
            </div>
        </section>
    );
};

export default ResourcesSection;
