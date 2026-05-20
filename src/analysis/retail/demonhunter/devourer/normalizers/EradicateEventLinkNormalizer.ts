import SPELLS from 'common/SPELLS/demonhunter';
import {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';

const SOUL_CONSUME_BUFFER = 500;

const ERADICATE_DAMAGE = 'EradicateDamage';
const MOMENT_OF_CRAVING_CONSUME = 'MomentOfCravingConsume';
const ERADICATE_SOUL_CONSUMED_VOIDMETA = 'EradicateSoulConsumedVoidMeta';
const ERADICATE_SOUL_CONSUME = 'EradicateSoulConsume';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: ERADICATE_SOUL_CONSUMED_VOIDMETA,
    referencedEventId: SPELLS.COLLAPSING_STAR_BUFF.id, // This link lets us add up all the souls consumed by an Eradicate cast while in Void Metamorphosis
    referencedEventType: EventType.ApplyBuffStack,
    linkingEventId: SPELLS.ERADICATE.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: SOUL_CONSUME_BUFFER,
    backwardBufferMs: 0,
    anyTarget: true,
    maximumLinks: 10,
  },
  {
    linkRelation: ERADICATE_SOUL_CONSUME,
    referencedEventId: SPELLS.VOID_METAMORPHOSIS_SOULS.id, // This link lets us add up all the souls consumed by an Eradicate cast while not in Void Metamorphosis
    referencedEventType: EventType.ApplyBuffStack,
    linkingEventId: SPELLS.ERADICATE.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: SOUL_CONSUME_BUFFER,
    backwardBufferMs: 0,
    anyTarget: true,
    maximumLinks: 10,
  },
  {
    linkRelation: MOMENT_OF_CRAVING_CONSUME,
    referencedEventId: SPELLS.MOMENT_OF_CRAVING_BUFF.id, // This link lets us know if an Eradicate cast consumed the Moment of Craving buff
    referencedEventType: EventType.RemoveBuff,
    linkingEventId: SPELLS.ERADICATE.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: 0,
    backwardBufferMs: 60,
    anyTarget: true,
    maximumLinks: 1,
  },
  {
    linkRelation: ERADICATE_DAMAGE,
    referencedEventId: [SPELLS.ERADICATE.id, SPELLS.ERADICATE.id],
    referencedEventType: EventType.Damage,
    linkingEventId: TALENTS_DEMON_HUNTER.ERADICATE_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: 250,
    anyTarget: true,
  },
];

export default class EradicateEventLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getEradicateSoulConsumptionsVoidMeta(
  event: CastEvent,
): (ApplyBuffStackEvent | ApplyBuffEvent)[] {
  return GetRelatedEvents(
    event,
    ERADICATE_SOUL_CONSUMED_VOIDMETA,
    (e): e is ApplyBuffStackEvent | ApplyBuffEvent =>
      e.type === EventType.ApplyBuffStack || e.type === EventType.ApplyBuff,
  );
}

export function getEradicateSoulConsumptions(
  event: CastEvent,
): (ApplyBuffStackEvent | ApplyBuffEvent)[] {
  return GetRelatedEvents(
    event,
    ERADICATE_SOUL_CONSUME,
    (e): e is ApplyBuffStackEvent | ApplyBuffEvent =>
      e.type === EventType.ApplyBuffStack || e.type === EventType.ApplyBuff,
  );
}

export function getEradicateMomentOfCravingConsumption(event: CastEvent): RemoveBuffEvent[] {
  return GetRelatedEvents(
    event,
    MOMENT_OF_CRAVING_CONSUME,
    (e): e is RemoveBuffEvent => e.type === EventType.RemoveBuff,
  );
}

export function getEradicateDamageEvents(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(
    event,
    ERADICATE_DAMAGE,
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}
