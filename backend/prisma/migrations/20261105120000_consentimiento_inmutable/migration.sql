-- RF03: el registro del consentimiento es inmutable; la base de datos solo permite insertarlo.
CREATE FUNCTION rechazar_cambio_consentimiento() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'El registro de consentimiento es inmutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consentimiento_inmutable
BEFORE UPDATE OR DELETE ON "consentimiento"
FOR EACH ROW EXECUTE FUNCTION rechazar_cambio_consentimiento();
